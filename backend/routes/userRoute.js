const express = require("express");
const { signup, login, me, logout } = require("../controller/userController");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authLimiter, loginLimiter } = require("../middleware/rateLimit");
const { signupSchema, loginSchema } = require("../validators");

const router = express.Router();

router.use(authLimiter);

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), loginLimiter, login);
router.get("/me", requireAuth, me);
router.post("/logout", logout);

module.exports = router;
