// Validates req.body with a zod schema and replaces it with the cleaned data.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid request";
    return res.status(400).json({ success: false, message });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
