/**
 * Basic HTTP Security Headers Middleware
 * Protects against MIME sniffing, clickjacking, and XSS attacks.
 */
export const securityHeadersMiddleware = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking / frame embedding
  res.setHeader("X-Frame-Options", "DENY");

  // Legacy browser XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Control referrer information sent in HTTP headers
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Remove X-Powered-By to prevent technology fingerprinting
  res.removeHeader("X-Powered-By");

  next();
};
