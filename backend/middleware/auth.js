const jwt = require("jsonwebtoken");
const config = require("../config/env");

// Protects routes: requires a valid JWT in the httpOnly "token" cookie.
const requireAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Please log in to continue" });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    req.user = { id: payload.id };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Session expired. Please log in again" });
  }
};

module.exports = requireAuth;
