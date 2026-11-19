const { z } = require("zod");
const config = require("./config/env");

const email = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .max(254, "Email is too long")
  .pipe(z.email("Please enter a valid email"));

const signupSchema = z.object({
  Name: z.string({ error: "Name is required" }).trim().min(1, "Name is required").max(50, "Name is too long"),
  Email: email,
  // bcrypt only uses the first 72 bytes, so cap the length instead of silently truncating.
  Password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

const loginSchema = z.object({
  Email: email,
  Password: z.string({ error: "Password is required" }).min(1, "Password is required").max(72),
});

const reviewSchema = z.object({
  prompt: z
    .string({ error: "Code is required" })
    .trim()
    .min(1, "Please enter some code to review")
    .max(config.maxCodeChars, `Code is too long (max ${config.maxCodeChars} characters)`),
});

module.exports = { signupSchema, loginSchema, reviewSchema };
