import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, AlertTriangle, ShieldAlert, Zap, BookOpen, Search, Info } from 'lucide-react';
import './FindingCard.css';

// ─── Severity Config ──────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critical', color: 'sev-critical', Icon: ShieldAlert },
  HIGH:     { label: 'High',     color: 'sev-high',     Icon: AlertTriangle },
  MEDIUM:   { label: 'Medium',   color: 'sev-medium',   Icon: AlertTriangle },
  LOW:      { label: 'Low',      color: 'sev-low',      Icon: Info },
  INFO:     { label: 'Info',     color: 'sev-info',     Icon: Info },
};

// ─── Category Config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  CORRECTNESS:  { label: 'Correctness',  Icon: AlertTriangle },
  SECURITY:     { label: 'Security',     Icon: ShieldAlert },
  PERFORMANCE:  { label: 'Performance',  Icon: Zap },
  READABILITY:  { label: 'Readability',  Icon: BookOpen },
  GENERAL:      { label: 'General',      Icon: Search },
};

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text, id }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <button
      id={id}
      className={`fc-copy-btn ${copied ? 'fc-copy-btn-done' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

// ─── Finding Card ─────────────────────────────────────────────────────────────

export default function FindingCard({ finding, index }) {
  const [open, setOpen] = useState(false);

  const sev = SEVERITY_CONFIG[finding.severity] ?? SEVERITY_CONFIG.INFO;
  const cat = CATEGORY_CONFIG[finding.category] ?? CATEGORY_CONFIG.GENERAL;
  const SevIcon = sev.Icon;
  const CatIcon = cat.Icon;

  const hasLines = finding.startLine != null;
  const lineLabel = hasLines
    ? finding.endLine && finding.endLine !== finding.startLine
      ? `Lines ${finding.startLine}–${finding.endLine}`
      : `Line ${finding.startLine}`
    : null;

  return (
    <div className={`fc-root ${sev.color} ${open ? 'fc-open' : ''}`}>

      {/* ── Card Header (always visible) ── */}
      <button
        className="fc-header"
        onClick={() => setOpen(o => !o)}
        id={`finding-card-${index}`}
        aria-expanded={open}
      >
        {/* Left: severity badge + title */}
        <div className="fc-header-left">
          <span className={`fc-sev-badge ${sev.color}`}>
            <SevIcon size={11} />
            {sev.label}
          </span>
          <span className="fc-title">{finding.title}</span>
        </div>

        {/* Right: category pill + line tag + chevron */}
        <div className="fc-header-right">
          {lineLabel && (
            <span className="fc-line-tag">
              {lineLabel}
            </span>
          )}
          <span className="fc-cat-pill">
            <CatIcon size={11} />
            {cat.label}
          </span>
          <span className="fc-chevron">
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </button>

      {/* ── Expanded Body ── */}
      {open && (
        <div className="fc-body">

          {/* Explanation */}
          <div className="fc-section">
            <h4 className="fc-section-title">🔍 Explanation</h4>
            <p className="fc-text">{finding.explanation}</p>
          </div>

          {/* Impact */}
          {finding.impact && (
            <div className="fc-section">
              <h4 className="fc-section-title">⚠️ Impact</h4>
              <p className="fc-text">{finding.impact}</p>
            </div>
          )}

          {/* Recommendation */}
          <div className="fc-section">
            <h4 className="fc-section-title">✅ Recommendation</h4>
            <p className="fc-text">{finding.recommendation}</p>
          </div>

          {/* Suggested Code */}
          {finding.suggestedCode && (
            <div className="fc-section">
              <div className="fc-code-header">
                <h4 className="fc-section-title">💡 Suggested Fix</h4>
                <CopyButton
                  text={finding.suggestedCode}
                  id={`btn-copy-finding-${index}`}
                />
              </div>
              <pre className="fc-code-block">
                <code>{finding.suggestedCode}</code>
              </pre>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
