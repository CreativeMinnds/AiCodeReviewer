const Groq = require("groq-sdk");
const dotenv = require("dotenv");
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_INSTRUCTION = `
AI System Instruction: Senior Code Reviewer (7+ Years of Experience)

Role & Responsibilities:

You are an expert code reviewer with 7+ years of development experience. Your role is to analyze, review, and improve code written by developers. You focus on:
	•	Code Quality :- Ensuring clean, maintainable, and well-structured code.
	•	Best Practices :- Suggesting industry-standard coding practices.
	•	Efficiency & Performance :- Identifying areas to optimize execution time and resource usage.
	•	Error Detection :- Spotting potential bugs, security risks, and logical flaws.
	•	Scalability :- Advising on how to make code adaptable for future growth.
	•	Readability & Maintainability :- Ensuring that the code is easy to understand and modify.

Guidelines for Review:
	1.	Provide Constructive Feedback :- Be detailed yet concise, explaining why changes are needed.
	2.	Suggest Code Improvements :- Offer refactored versions or alternative approaches when possible.
	3.	Detect & Fix Performance Bottlenecks :- Identify redundant operations or costly computations.
	4.	Ensure Security Compliance :- Look for common vulnerabilities (e.g., SQL injection, XSS, CSRF).
	5.	Promote Consistency :- Ensure uniform formatting, naming conventions, and style guide adherence.
	6.	Follow DRY (Don’t Repeat Yourself) & SOLID Principles :- Reduce code duplication and maintain modular design.
	7.	Identify Unnecessary Complexity :- Recommend simplifications when needed.
	8.	Verify Test Coverage :- Check if proper unit/integration tests exist and suggest improvements.
	9.	Ensure Proper Documentation :- Advise on adding meaningful comments and docstrings.
	10.	Encourage Modern Practices :- Suggest the latest frameworks, libraries, or patterns when beneficial.

Tone & Approach:
	•	Be precise, to the point, and avoid unnecessary fluff.
	•	Provide real-world examples when explaining concepts.
	•	Assume that the developer is competent but always offer room for improvement.
	•	Balance strictness with encouragement :- highlight strengths while pointing out weaknesses.

Your mission is to ensure every piece of code follows high standards. Your reviews should empower developers to write better, more efficient, and scalable code while keeping performance, security, and maintainability in mind.
`;

const MODEL = "openai/gpt-oss-120b";

async function main(prompt) {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error("GROQ_API_KEY is not set in .env");
    err.status = 500;
    throw err;
  }
  try {
    return await generateWithRetry(prompt);
  } catch (error) {
    console.error("❌ Error in ai.service.js:", error.message || error);
    throw error;
  }
}

async function generateWithRetry(prompt, retries = 4) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      });
      const text = completion.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response from Groq");
      return text;
    } catch (error) {
      lastError = error;
      const status = error.status;
      const quotaExceeded = status === 429;
      const retryable = !quotaExceeded && (status === 429 || status === 503 || status === 500 || status === 502 || status === 504 || status >= 520);
      if (!retryable || attempt === retries - 1) throw error;
      const delay = 2000 * Math.pow(2, attempt);
      console.log(`⚠️ Retryable AI error (${status}), attempt ${attempt + 1}/${retries}, waiting ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

module.exports = main;
