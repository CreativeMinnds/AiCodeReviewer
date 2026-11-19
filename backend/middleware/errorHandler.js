const notFound = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

// Central error handler: never leaks internals to the client.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request is too large" });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON" });
  }
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "Origin not allowed" });
  }
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Something went wrong" });
};

module.exports = { notFound, errorHandler };
