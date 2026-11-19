const express = require("express");
const getReview = require("../controller/aiController");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { aiBurstLimiter, aiHourlyLimiter } = require("../middleware/rateLimit");
const { reviewSchema } = require("../validators");

const router = express.Router();

// Order matters: authenticate first so the limiters can count per user.
router.post("/get-review", requireAuth, aiBurstLimiter, aiHourlyLimiter, validate(reviewSchema), getReview);

module.exports = router;
