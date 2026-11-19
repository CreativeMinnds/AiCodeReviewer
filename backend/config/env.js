const dotenv = require("dotenv");
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

// Fail fast: a server that boots with missing secrets is worse than one that refuses to start.
const required = ["JWT_SECRET", "GROQ_API_KEY"];
if (isProd) required.push("MONGO_URI");
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  const msg = "JWT_SECRET should be a random string of at least 32 characters.";
  if (isProd) {
    console.error(msg);
    process.exit(1);
  }
  console.warn(`Warning: ${msg}`);
}

const cookieSameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();

module.exports = {
  isProd,
  port: Number(process.env.PORT) || 2000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/AiCodeReviewer",
  jwtSecret: process.env.JWT_SECRET,
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  // Comma-separated list of allowed browser origins (only needed if the frontend calls the API cross-origin).
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  cookieSameSite,
  // SameSite=None is only accepted by browsers together with Secure.
  cookieSecure: isProd || cookieSameSite === "none",
  // Number of reverse proxies in front of the app (Render's load balancer = 1).
  trustProxyHops: Number(process.env.TRUST_PROXY_HOPS ?? 1),
  maxCodeChars: 10000,
};
