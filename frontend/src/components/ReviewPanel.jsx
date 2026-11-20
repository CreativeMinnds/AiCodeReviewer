import { useState } from "react";
import Markdown from "react-markdown";
import "./ReviewPanel.css";

const SEVERITY_LABELS = { critical: "Critical", warning: "Warning", suggestion: "Suggestion" };
const SEVERITY_ICONS = { critical: "🔴", warning: "🟡", suggestion: "🔵" };
const CATEGORY_LABELS = {
  bug: "Bug",
  security: "Security",
  performance: "Performance",
  readability: "Readability",
  "best-practice": "Best practice",
};

const scoreClass = (score) => (score >= 8 ? "good" : score >= 5 ? "ok" : "bad");

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (for example on plain http); the user can still select the text.
    }
  }

  return (
    <button type="button" className="rp-btn" onClick={copy}>
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
};

const ReviewPanel = ({ review, loading, error, onUseCode }) => {
  const [filter, setFilter] = useState("all");

  if (error) {
    return (
      <div className="rp-error" role="alert">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rp-loading" aria-live="polite">
        <div className="rp-skeleton rp-skeleton-title" />
        <div className="rp-skeleton" />
        <div className="rp-skeleton" />
        <div className="rp-skeleton rp-skeleton-short" />
        <p className="rp-muted">Reviewing your code...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="rp-empty">
        <p>Your review will appear here.</p>
        <p className="rp-muted">Paste code on the left, pick a language and review mode, then click Review.</p>
      </div>
    );
  }

  // The model sometimes ignores the JSON format; the server then sends its text as a summary.
  if (review.fallback) {
    return (
      <div className="rp-card rp-md">
        <Markdown>{review.summary}</Markdown>
      </div>
    );
  }

  const counts = { all: review.issues.length };
  for (const severity of Object.keys(SEVERITY_LABELS)) {
    counts[severity] = review.issues.filter((issue) => issue.severity === severity).length;
  }
  const activeFilter = filter === "all" || counts[filter] > 0 ? filter : "all";
  const visibleIssues = activeFilter === "all" ? review.issues : review.issues.filter((i) => i.severity === activeFilter);

  return (
    <div className="rp-root">
      <section className="rp-header">
        {review.score !== null && (
          <div className={`rp-score ${scoreClass(review.score)}`} title="Overall score">
            <span className="rp-score-number">{review.score}</span>
            <span className="rp-score-max">/10</span>
          </div>
        )}
        <div className="rp-header-text">
          <h2 className="rp-title">
            Code Review
            {review.language && <span className="rp-chip">{review.language}</span>}
          </h2>
          {review.summary && <p className="rp-summary">{review.summary}</p>}
        </div>
      </section>

      {review.issues.length > 0 ? (
        <>
          <div className="rp-filters" role="group" aria-label="Filter issues by severity">
            {["all", "critical", "warning", "suggestion"].map((key) => (
              <button
                key={key}
                type="button"
                className={`rp-filter ${key} ${activeFilter === key ? "active" : ""}`}
                aria-pressed={activeFilter === key}
                onClick={() => setFilter(key)}
                disabled={counts[key] === 0}
              >
                {key === "all" ? "All" : SEVERITY_LABELS[key]} ({counts[key]})
              </button>
            ))}
          </div>

          <ul className="rp-issues">
            {visibleIssues.map((issue, index) => (
              <li key={`${issue.title}-${index}`} className={`rp-issue ${issue.severity}`}>
                <div className="rp-issue-head">
                  <span className="rp-issue-icon" aria-hidden="true">
                    {SEVERITY_ICONS[issue.severity]}
                  </span>
                  <strong className="rp-issue-title">{issue.title || SEVERITY_LABELS[issue.severity]}</strong>
                  <span className="rp-chip">{CATEGORY_LABELS[issue.category]}</span>
                  {issue.line && <span className="rp-chip rp-line">Line {issue.line}</span>}
                </div>
                {issue.description && (
                  <div className="rp-md">
                    <Markdown>{issue.description}</Markdown>
                  </div>
                )}
                {issue.fix && (
                  <div className="rp-fix">
                    <span className="rp-fix-label">Fix</span>
                    <div className="rp-md">
                      <Markdown>{issue.fix}</Markdown>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="rp-clean">✅ No issues found.</p>
      )}

      {review.positives.length > 0 && (
        <section className="rp-card">
          <h3 className="rp-section-title">What&apos;s good</h3>
          <ul className="rp-positives">
            {review.positives.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {review.improvedCode && (
        <details className="rp-card rp-improved" open>
          <summary className="rp-section-title">Improved code</summary>
          <div className="rp-actions">
            <CopyButton text={review.improvedCode} />
            <button type="button" className="rp-btn" onClick={() => onUseCode(review.improvedCode)}>
              Use in editor
            </button>
          </div>
          <pre className="rp-code">
            <code>{review.improvedCode}</code>
          </pre>
        </details>
      )}
    </div>
  );
};

export default ReviewPanel;