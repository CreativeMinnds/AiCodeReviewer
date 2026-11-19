const config = require("./config/env"); // loads .env and validates it first
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectionDb = require("./db");
const userRouter = require("./routes/userRoute");
const aiRouter = require("./routes/aiRoutes");
const { globalLimiter } = require("./middleware/rateLimit");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Needed so rate limiting sees the real client IP behind Render's proxy.
app.set("trust proxy", config.trustProxyHops);
app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header = same-origin request, curl, or health checks.
      if (!origin || config.clientOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(globalLimiter);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth", userRouter);
app.use("/api/ai", aiRouter);

app.use(notFound);
app.use(errorHandler);

connectionDb();

app.listen(config.port, () => {
  console.log(`Server is listening on PORT ${config.port}`);
});
