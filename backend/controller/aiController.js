const aiService = require("../services/ai.service");

const getReview = async (req, res) => {
  try {
    // req.body is already cleaned and length-checked by the validator.
    const { prompt, language, mode } = req.body;
    const review = await aiService(prompt, { language, mode });
    return res.status(200).json({ success: true, review });
  } catch (error) {
    // Log the reason server-side only; never log the user's code.
    console.error("AI review failed:", error.status || "", error.message);

    if (error.status === 429) {
      return res.status(503).json({ success: false, message: "The AI service is busy. Please try again shortly." });
    }
    if (error.name === "APIConnectionTimeoutError") {
      return res.status(504).json({ success: false, message: "The review took too long. Try a shorter snippet." });
    }
    return res.status(502).json({ success: false, message: "The AI review failed. Please try again." });
  }
};

module.exports = getReview;