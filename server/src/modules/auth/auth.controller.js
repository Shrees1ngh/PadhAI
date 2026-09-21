import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./user.model.js";
import { registerInputSchema, loginInputSchema } from "./auth.validator.js";
import { ENV } from "../../config/env.js";

// In-memory fallback registry for local development when MongoDB is offline
const memoryUsers = new Map();

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
        });

        await newUser.save();
        savedUserObj = newUser.toJSON();
        dbSuccess = true;
      } catch (dbErr) {
        console.warn("MongoDB register failed, using in-memory fallback:", dbErr.message);
      }
    }

    if (!dbSuccess) {
      if (memoryUsers.has(normalizedEmail)) {
        return res.status(409).json({
          success: false,
          code: "EMAIL_ALREADY_EXISTS",
          message: "An account with this email address already exists. Please log in instead.",
        });
      }

      const devUser = {
        _id: "usr_" + Date.now(),
        id: "usr_" + Date.now(),
        name: validatedInput.name,
        email: normalizedEmail,
        passwordHash,
        avatar: validatedInput.avatar || "",
        authProvider: "local",
        createdAt: new Date().toISOString(),
      };

      memoryUsers.set(normalizedEmail, devUser);
      savedUserObj = {
        id: devUser.id,
        name: devUser.name,
        email: devUser.email,
        avatar: devUser.avatar,
        authProvider: "local",
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
        console.warn("MongoDB login lookup failed, checking in-memory store:", dbErr.message);
      }
    }

    // Fallback to memory store if not found in DB
    if (!user && memoryUsers.has(normalizedEmail)) {
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

    // Return decoded token user info immediately
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar || "",
        authProvider: req.user.authProvider || "local",
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
 * GET /api/auth/google/url
 * Returns the Google OAuth 2.0 authorization URL
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

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: ENV.GOOGLE_CALLBACK_URL,
    client_id: ENV.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options).toString();
  const authUrl = `${rootUrl}?${qs}`;

  return res.status(200).json({
    success: true,
    configured: true,
    url: authUrl,
  });
};

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth callback redirect
 */
export const googleCallbackHandler = async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    console.warn("Google OAuth error or cancellation:", error);
    return res.redirect(
      `${ENV.CLIENT_URL}/?auth_error=${encodeURIComponent(
        error || "Google authentication was cancelled or failed."
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
    if (!tokenResponse.ok || !tokenData.access_type && !tokenData.id_token && !tokenData.access_token) {
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

    const normalizedEmail = googleUser.email.toLowerCase().trim();
    const googleId = googleUser.sub;
    const name = googleUser.name || googleUser.given_name || "Google Learner";
    const avatar = googleUser.picture || "";

    // 3. Find user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    if (user) {
      // Safely link Google ID if user originally registered via email
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }
      await user.save();
    } else {
      // Create new Google OAuth user
      user = new User({
        name,
        email: normalizedEmail,
        googleId,
        avatar,
        authProvider: "google",
      });
      await user.save();
    }

    // 4. Generate JWT
    const token = generateUserToken(user);

    // 5. Redirect back to frontend with session token
    return res.redirect(`${ENV.CLIENT_URL}/?auth_token=${token}&auth_success=true`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return res.redirect(
      `${ENV.CLIENT_URL}/?auth_error=${encodeURIComponent(
        err.message || "Failed to complete Google Sign-In"
      )}`
    );
  }
};
