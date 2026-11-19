import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import "prismjs/components/prism-javascript";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";
import api, { errorMessage } from "../api";
import "./Home.css";

const MAX_CODE_CHARS = 10000; // keep in sync with the backend limit

const Home = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    if (loading || !code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/ai/get-review", { prompt: code });
      setReview(response.data.message);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login"); // session expired
        return;
      }
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

  return (
    <main>
      <div className="left">
        <div className="code">
          <Editor
            value={code}
            onValueChange={(value) => setCode(value)}
            highlight={(value) =>
              prism.highlight(value, prism.languages.javascript, "javascript")
            }
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
          disabled={loading || tooLong || !code.trim()}
          className="review"
          style={{
            border: "none",
            opacity: loading || tooLong || !code.trim() ? 0.6 : 1,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Reviewing..." : "Review"}
        </button>
      </div>

      <div
        className="right"
        style={{
          padding: "1rem",
          backgroundColor: "#1e1e1e",
          color: "#ffffff",
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "90vh",
          border: "1px solid #444",
          borderRadius: "5px",
          marginLeft: "1rem",
          width: "100%",
          wordBreak: "normal",
          overflowWrap: "break-word",
          whiteSpace: "normal",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={logout}
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.75rem",
            background: "transparent",
            border: "1px solid #555",
            color: "#ccc",
            borderRadius: "0.4rem",
            padding: "0.15rem 0.6rem",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
        {error && <p style={{ color: "#f87171" }}>{error}</p>}
        {!error && !review && !loading && (
          <p style={{ color: "#9ca3af" }}>
            Your review will appear here. Paste code and click Review.
          </p>
        )}
        {loading && <p style={{ color: "#9ca3af" }}>Reviewing your code...</p>}
        {!loading && !error && review && (
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              table: (props) => (
                <div style={{ overflowX: "auto" }}>
                  <table {...props} />
                </div>
              ),
            }}
          >
            {review}
          </Markdown>
        )}
      </div>
    </main>
  );
};

export default Home;