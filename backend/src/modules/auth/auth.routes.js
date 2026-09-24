import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  getMeHandler,
  getGoogleAuthUrlHandler,
  googleDirectRedirectHandler,
  googleCallbackHandler,
  exchangeCodeHandler,
} from "./auth.controller.js";
import { authenticateToken } from "./auth.middleware.js";
import { authRateLimiter } from "./rateLimiter.middleware.js";

const router = Router();

// Local Authentication Endpoints (Rate Limited)
router.post("/register", authRateLimiter, registerHandler);
router.post("/login", authRateLimiter, loginHandler);
router.post("/exchange", authRateLimiter, exchangeCodeHandler);
router.get("/me", authenticateToken, getMeHandler);

// Google OAuth 2.0 Endpoints
router.get("/google", googleDirectRedirectHandler);
router.get("/google/login", googleDirectRedirectHandler);
router.get("/google/url", getGoogleAuthUrlHandler);
router.get("/google/callback", googleCallbackHandler);

// Status route
router.get("/", (req, res) => {
  res.json({
    module: "authentication",
    status: "active",
    endpoints: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/me",
      "GET /api/auth/google",
      "GET /api/auth/google/url",
      "GET /api/auth/google/callback",
    ],
  });
});

export default router;
