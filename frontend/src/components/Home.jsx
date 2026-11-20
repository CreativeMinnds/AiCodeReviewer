import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
// Core Prism already includes JavaScript; these add the other editor languages.
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-sql";
import api, { errorMessage } from "../api";
import ReviewPanel from "./ReviewPanel";
import "./Home.css";

const MAX_CODE_CHARS = 10000; // keep in sync with the backend limit

// value must match the backend's allowed languages; "auto" lets the AI detect it.
const LANGUAGES = [
  { value: "auto", label: "Auto-detect", grammar: "javascript" },
  { value: "javascript", label: "JavaScript", grammar: "javascript" },
  { value: "typescript", label: "TypeScript", grammar: "typescript" },
  { value: "python", label: "Python", grammar: "python" },
  { value: "java", label: "Java", grammar: "java" },
  { value: "c", label: "C", grammar: "c" },
  { value: "cpp", label: "C++", grammar: "cpp" },
  { value: "csharp", label: "C#", grammar: "csharp" },
  { value: "go", label: "Go", grammar: "go" },
  { value: "sql", label: "SQL", grammar: "sql" },
];

const MODES = [
  { value: "full", label: "Full review" },
  { value: "security", label: "Security focus" },
  { value: "beginner", label: "Beginner-friendly" },
  { value: "cleanup", label: "Quick cleanup" },
];

const Home = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);
  const [language, setLanguage] = useState("auto");
  const [mode, setMode] = useState("full");
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const grammarName = LANGUAGES.find((l) => l.value === language)?.grammar || "javascript";

  function highlight(value) {
    const grammar = prism.languages[grammarName] || prism.languages.javascript;
    return prism.highlight(value, grammar, grammarName);
  }

  async function reviewCode() {
    if (loading || !code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/ai/get-review", { prompt: code, language, mode });
      setReview(response.data.review);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login"); // session expired
        return;
      }
      setReview(null);
      setError(errorMessage(err, "Something went wrong during review."));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      navigate("/login");
    }
  }

  const tooLong = code.length > MAX_CODE_CHARS;
  const disabled = loading || tooLong || !code.trim();

  return (
    <main>
      <div className="left">
        <div className="code">
          <Editor
            value={code}
            onValueChange={(value) => setCode(value)}
            highlight={highlight}
            padding={10}
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              border: "1px solid #ddd",
              borderRadius: "5px",
              height: "100%",
              color: "#fff",
              width: "100%",
            }}
          />
        </div>
        <span
          style={{
            position: "absolute",
            bottom: "1.4rem",
            left: "1rem",
            fontSize: "0.8rem",
            color: tooLong ? "#f87171" : "#9ca3af",
          }}
        >
          {code.length}/{MAX_CODE_CHARS}
        </span>
        <button
          type="button"
          onClick={reviewCode}
          disabled={disabled}
          className="review"
          style={{
            border: "none",
            opacity: disabled ? 0.6 : 1,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Reviewing..." : "Review"}
        </button>
      </div>

      <div className="right">
        <div className="rp-toolbar">
          <label>
            Language
            <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={loading}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mode
            <select value={mode} onChange={(e) => setMode(e.target.value)} disabled={loading}>
              {MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="rp-logout" onClick={logout}>
            Logout
          </button>
        </div>

        <ReviewPanel review={review} loading={loading} error={error} onUseCode={setCode} />
      </div>
    </main>
  );
};

export default Home;