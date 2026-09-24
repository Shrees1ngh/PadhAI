import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./user.model.js";
import {
  registerInputSchema,
  loginInputSchema,
  exchangeCodeInputSchema,
} from "./auth.validator.js";
import { ENV } from "../../config/env.js";

// In-memory fallback registry for local development when MongoDB is offline
const memoryUsers = new Map();

// Single-use authentication code cache for OAuth exchange (60s TTL)
const authCodeStore = new Map();

// Periodic cleanup of expired auth codes
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of authCodeStore.entries()) {
    if (entry.expiresAt < now) {
      authCodeStore.delete(code);
    }
  }
}, 30000);

// Helper to generate standard JWT token
export const generateUserToken = (user) => {
  const userId = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    {
      id: userId,
      email: user.email,
      name: user.name,
      avatar: user.avatar || "",
    },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * POST /api/auth/register
 * Registers a new local user with email and password
 */
export const registerHandler = async (req, res) => {
  try {
    const validatedInput = registerInputSchema.parse(req.body);
    const normalizedEmail = validatedInput.email.toLowerCase().trim();
    const isDbConnected = mongoose.connection.readyState === 1;
    const isProduction = process.env.NODE_ENV === "production" || ENV.NODE_ENV === "production";

    // Hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(validatedInput.password, 10);
    let dbSuccess = false;
    let savedUserObj = null;

    if (isDbConnected) {
      try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            code: "EMAIL_ALREADY_EXISTS",
            message: "An account with this email address already exists. Please log in instead.",
          });
        }

        const newUser = new User({
          name: validatedInput.name,
          email: normalizedEmail,
          passwordHash,
          avatar: validatedInput.avatar || "",
          authProvider: "local",
          emailVerified: false,
        });

        await newUser.save();
        savedUserObj = newUser.toJSON();
        dbSuccess = true;
      } catch (dbErr) {
        console.warn("MongoDB register failed:", dbErr.message);
      }
    }

    if (!dbSuccess) {
      if (isProduction) {
        return res.status(503).json({
          success: false,
          code: "DATABASE_UNAVAILABLE",
          message: "Registration service is temporarily unavailable.",
        });
      }

      if (memoryUsers.has(normalizedEmail)) {
        return res.status(409).json({
          success: false,
          code: "EMAIL_ALREADY_EXISTS",
          message: "An account with this email address already exists. Please log in instead.",
        });
      }

      const devObjectId = new mongoose.Types.ObjectId().toString();
      const devUser = {
        _id: devObjectId,
        id: devObjectId,
        name: validatedInput.name,
        email: normalizedEmail,
        passwordHash,
        avatar: validatedInput.avatar || "",
        authProvider: "local",
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };

      memoryUsers.set(normalizedEmail, devUser);
      savedUserObj = {
        id: devUser.id,
        name: devUser.name,
        email: devUser.email,
        avatar: devUser.avatar,
        authProvider: "local",
        emailVerified: false,
      };
    }

    const token = generateUserToken(savedUserObj);
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: savedUserObj,
    });
  } catch (error) {
    console.error("Error in registerHandler:", error);
    if (error.name === "ZodError" || error.issues) {
      const issues = error.issues || error.errors || [];
      return res.status(400).json({
        success: false,
        message: issues[0]?.message || "Invalid registration input.",
        errors: issues,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create account. Please try again.",
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticates an existing user and returns a JWT
 */
export const loginHandler = async (req, res) => {
  try {
    const validatedInput = loginInputSchema.parse(req.body);
    const normalizedEmail = validatedInput.email.toLowerCase().trim();
    const isDbConnected = mongoose.connection.readyState === 1;
    const isProduction = process.env.NODE_ENV === "production" || ENV.NODE_ENV === "production";

    let user = null;
    let passwordHashToCompare = null;

    if (isDbConnected) {
      try {
        const dbUser = await User.findOne({ email: normalizedEmail });
        if (dbUser) {
          user = dbUser.toJSON ? dbUser.toJSON() : dbUser;
          passwordHashToCompare = dbUser.passwordHash;
        }
      } catch (dbErr) {
        console.warn("MongoDB login lookup failed:", dbErr.message);
      }
    }

    // Fallback to memory store if not found in DB (dev mode only)
    if (!user && !isProduction && memoryUsers.has(normalizedEmail)) {
      user = memoryUsers.get(normalizedEmail);
      passwordHashToCompare = user.passwordHash;
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    // Check if account was created via Google OAuth with no password set
    if (!passwordHashToCompare && user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        code: "USE_GOOGLE_SIGNIN",
        message:
          "This account was created using Google Sign-In. Please click 'Continue with Google' to sign in.",
      });
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(validatedInput.password, passwordHashToCompare);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    // Generate JWT token
    const token = generateUserToken(user);
    const userObj = user.toJSON ? user.toJSON() : {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
      authProvider: user.authProvider || "local",
      emailVerified: !!user.emailVerified,
    };

    return res.status(200).json({
      success: true,
      message: "Welcome back!",
      token,
      user: userObj,
    });
  } catch (error) {
    console.error("Error in loginHandler:", error);
    if (error.name === "ZodError" || error.issues) {
      const issues = error.issues || error.errors || [];
      return res.status(400).json({
        success: false,
        message: issues[0]?.message || "Invalid login input.",
        errors: issues,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed. Please try again.",
    });
  }
};

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile
 */
export const getMeHandler = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const user = await User.findById(req.user.id);
      if (user) {
        return res.status(200).json({
          success: true,
          user: user.toJSON(),
        });
      }
    }

    // Return decoded token user info
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar || "",
        authProvider: req.user.authProvider || "local",
        emailVerified: !!req.user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Error in getMeHandler:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve user profile.",
    });
  }
};

/**
 * Helper to build cross-site and production-ready cookie options
 */
export const getOAuthCookieOptions = (isProduction) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: "/",
});

/**
 * Helper to generate a tamper-proof, time-bound HMAC-signed OAuth state token.
 * Guarantees CSRF protection without depending on cross-site/third-party cookies.
 */
export const generateOAuthState = () => {
  const payload = {
    ts: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
  };
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ENV.JWT_SECRET)
    .update(payloadEncoded)
    .digest("base64url");
  return `${payloadEncoded}.${signature}`;
};

/**
 * Helper to verify an OAuth state token.
 * Validates HMAC signature, ensures expiration within 15 minutes, and prevents future timestamps.
 */
export const verifyOAuthState = (state, cookieState) => {
  // Strategy 1: Cryptographic HMAC signature verification (Stateless & Cross-Origin immune)
  if (state && typeof state === "string" && state.includes(".")) {
    const parts = state.split(".");
    if (parts.length === 2) {
      const [payloadEncoded, signature] = parts;
      try {
        const expectedSignature = crypto
          .createHmac("sha256", ENV.JWT_SECRET)
          .update(payloadEncoded)
          .digest("base64url");

        if (
          signature.length === expectedSignature.length &&
          crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
        ) {
          const payload = JSON.parse(Buffer.from(payloadEncoded, "base64url").toString("utf8"));
          const age = Date.now() - payload.ts;
          const maxAge = 15 * 60 * 1000; // 15 minutes
          // Valid if between -60s (allow minor clock drift) and 15 minutes
          if (age >= -60000 && age <= maxAge) {
            return true;
          } else {
            console.warn(`[OAuth] State token expired or clock drift issue: age=${age}ms`);
          }
        } else {
          console.warn("[OAuth] State signature mismatch: possible tampering or secret mismatch");
        }
      } catch (err) {
        console.warn("[OAuth] Failed to decode or verify HMAC state:", err.message);
      }
    }
  }

  // Strategy 2: Cookie comparison (Fallback if cookie survived cross-site redirect)
  if (cookieState && state && state === cookieState) {
    return true;
  }

  return false;
};

/**
 * Internal helper to construct the Google OAuth 2.0 URL and set the state cookie
 */
const createGoogleOAuthSession = (req, res) => {
  const state = generateOAuthState();
  const isProduction = process.env.NODE_ENV === "production" || ENV.NODE_ENV === "production";

  // Store state in cookie with cross-site compatible attributes
  res.cookie("google_oauth_state", state, getOAuthCookieOptions(isProduction));

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: ENV.GOOGLE_CALLBACK_URL,
    client_id: ENV.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    state,
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options).toString();
  const authUrl = `${rootUrl}?${qs}`;

  return { authUrl, state };
};

/**
 * GET /api/auth/google/url
 * Returns the Google OAuth 2.0 authorization URL with CSRF state token
 */
export const getGoogleAuthUrlHandler = (req, res) => {
  if (!ENV.GOOGLE_CLIENT_ID) {
    return res.status(400).json({
      success: false,
      configured: false,
      message:
        "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env.",
    });
  }

  const { authUrl } = createGoogleOAuthSession(req, res);

  return res.status(200).json({
    success: true,
    configured: true,
    url: authUrl,
  });
};

/**
 * GET /api/auth/google
 * Direct browser navigation endpoint that redirects straight to Google OAuth
 */
export const googleDirectRedirectHandler = (req, res) => {
  if (!ENV.GOOGLE_CLIENT_ID) {
    return res.redirect(
      `${ENV.CLIENT_URL}/?auth_error=${encodeURIComponent(
        "Google OAuth is not configured on the server."
      )}`
    );
  }

  const { authUrl } = createGoogleOAuthSession(req, res);
  return res.redirect(authUrl);
};

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth callback redirect, verifies state, checks email_verified, and generates a single-use exchange code
 */
export const googleCallbackHandler = async (req, res) => {
  const { code, state, error } = req.query;
  const cookieState = req.cookies?.google_oauth_state;
  const isProduction = process.env.NODE_ENV === "production" || ENV.NODE_ENV === "production";

  // Clear state cookie with matching options
  res.clearCookie("google_oauth_state", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  if (error || !code) {
    console.warn("Google OAuth error or cancellation:", error);
    return res.redirect(
      `${ENV.CLIENT_URL}/?auth_error=${encodeURIComponent(
        error || "Google authentication was cancelled or failed."
      )}`
    );
  }

  // Verify OAuth state using dual-verification (HMAC signature OR cookie match)
  const isStateValid = verifyOAuthState(state, cookieState);
  if (!isStateValid) {
    console.warn("[OAuth] State verification failed. State:", state, "Cookie:", cookieState);
    return res.redirect(
      `${ENV.CLIENT_URL}/?auth_error=${encodeURIComponent(
        "Google OAuth state verification failed. Possible CSRF attempt."
      )}`
    );
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenParams = new URLSearchParams({
      code: String(code),
      client_id: ENV.GOOGLE_CLIENT_ID,
      client_secret: ENV.GOOGLE_CLIENT_SECRET,
      redirect_uri: ENV.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || (!tokenData.access_token && !tokenData.id_token)) {
      throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange code with Google");
    }

    // 2. Fetch user profile from Google UserInfo endpoint
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoResponse.json();
    if (!googleUser.email) {
      throw new Error("Could not retrieve email from Google profile.");
    }

    // Require email_verified === true
    if (googleUser.email_verified !== true && googleUser.verified_email !== true) {
      return res.redirect(
        `${ENV.CLIENT_URL}/?auth_error=${encodeURIComponent(
          "Your Google email is not verified. Please verify your email with Google before signing in."
        )}`
      );
    }

    const normalizedEmail = googleUser.email.toLowerCase().trim();
    const googleId = googleUser.sub;
    const name = googleUser.name || googleUser.given_name || "Google Learner";
    const avatar = googleUser.picture || "";

    // 3. Find user by googleId or email (with DB and memory fallback)
    let user = null;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      user = await User.findOne({
        $or: [{ googleId }, { email: normalizedEmail }],
      });

      if (user) {
        // Check if user is a local account without Google linked yet
        if (user.authProvider === "local" && !user.googleId) {
          if (!user.emailVerified) {
            return res.redirect(
              `${ENV.CLIENT_URL}/?auth_error=${encodeURIComponent(
                "An account with this email exists but is not verified. Please log in with your email and password to verify your account before linking Google."
              )}`
            );
          }
          user.googleId = googleId;
        }

        if (!user.avatar && avatar) {
          user.avatar = avatar;
        }
        await user.save();
      } else {
        // Create new Google OAuth user (emailVerified is true because Google verified it)
        user = new User({
          name,
          email: normalizedEmail,
          googleId,
          avatar,
          authProvider: "google",
          emailVerified: true,
        });
        await user.save();
      }
    } else {
      // Memory fallback for development when MongoDB is offline
      if (memoryUsers.has(normalizedEmail)) {
        user = memoryUsers.get(normalizedEmail);
        user.avatar = avatar || user.avatar;
        user.googleId = googleId;
      } else {
        const devId = new mongoose.Types.ObjectId().toString();
        user = {
          _id: devId,
          id: devId,
          name,
          email: normalizedEmail,
          googleId,
          avatar,
          authProvider: "google",
          emailVerified: true,
        };
        memoryUsers.set(normalizedEmail, user);
      }
    }

    // 4. Generate JWT
    const token = generateUserToken(user);
    const userObj = user.toJSON ? user.toJSON() : {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
      authProvider: user.authProvider || "google",
      emailVerified: true,
    };

    // 5. Store one-time auth code (60s, single use)
    const authCode = crypto.randomBytes(24).toString("hex");
    authCodeStore.set(authCode, {
      token,
      user: userObj,
      expiresAt: Date.now() + 60 * 1000,
    });

    // 6. Redirect to frontend with one-time exchange code
    return res.redirect(`${ENV.CLIENT_URL}/?auth_code=${authCode}&auth_success=true`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return res.redirect(
      `${ENV.CLIENT_URL}/?auth_error=${encodeURIComponent(
        err.message || "Failed to complete Google Sign-In"
      )}`
    );
  }
};

/**
 * POST /api/auth/exchange
 * Exchanges a single-use 60s auth_code from OAuth callback for a JWT token and user profile
 */
export const exchangeCodeHandler = async (req, res) => {
  try {
    const { code } = exchangeCodeInputSchema.parse(req.body);
    const entry = authCodeStore.get(code);

    if (!entry) {
      return res.status(400).json({
        success: false,
        code: "INVALID_AUTH_CODE",
        message: "Authentication code is invalid or has already been used.",
      });
    }

    // Remove immediately for single-use guarantee
    authCodeStore.delete(code);

    if (entry.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        code: "AUTH_CODE_EXPIRED",
        message: "Authentication code has expired (60s limit). Please sign in again.",
      });
    }

    return res.status(200).json({
      success: true,
      token: entry.token,
      user: entry.user,
    });
  } catch (err) {
    if (err.name === "ZodError" || err.issues) {
      const issues = err.issues || err.errors || [];
      return res.status(400).json({
        success: false,
        message: issues[0]?.message || "Invalid exchange code request.",
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to exchange auth code.",
    });
  }
};

