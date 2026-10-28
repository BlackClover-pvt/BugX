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

  async function handleCopy(e) {
    e.stopPropagation();
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
      title={copied ? 'Copied to clipboard!' : 'Copy code'}
      type="button"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
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
      ? `L${finding.startLine}–${finding.endLine}`
      : `L${finding.startLine}`
    : null;

  return (
    <div className={`fc-root ${sev.color} ${open ? 'fc-open' : ''}`}>

      {/* ── Card Header (always visible) ── */}
      <button
        className="fc-header"
        onClick={() => setOpen(o => !o)}
        id={`finding-card-${index}`}
        aria-expanded={open}
        type="button"
      >
        {/* Left: severity badge + title */}
        <div className="fc-header-left">
          <span className={`fc-sev-badge ${sev.color}`}>
            <SevIcon size={12} />
            <span>{sev.label}</span>
          </span>
          <span className="fc-title" title={finding.title}>{finding.title}</span>
        </div>

        {/* Right: category pill + line tag + chevron */}
        <div className="fc-header-right">
          {lineLabel && (
            <span className="fc-line-tag" title={`Lines in source: ${lineLabel}`}>
              {lineLabel}
            </span>
          )}
          <span className="fc-cat-pill">
            <CatIcon size={11} />
            <span>{cat.label}</span>
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
          <div className="fc-section fc-section-explanation">
            <div className="fc-section-header">
              <span className="fc-section-badge">
                <Search size={12} />
                <span>EXPLANATION</span>
              </span>
            </div>
            <p className="fc-text">{finding.explanation}</p>
          </div>

          {/* Impact */}
          {finding.impact && (
            <div className="fc-section fc-section-impact">
              <div className="fc-section-header">
                <span className="fc-section-badge warning">
                  <AlertTriangle size={12} />
                  <span>IMPACT</span>
                </span>
              </div>
              <p className="fc-text">{finding.impact}</p>
            </div>
          )}

          {/* Recommendation */}
          <div className="fc-section fc-section-recommendation">
            <div className="fc-section-header">
              <span className="fc-section-badge success">
                <Check size={12} />
                <span>RECOMMENDATION</span>
              </span>
            </div>
            <p className="fc-text">{finding.recommendation}</p>
          </div>

          {/* Suggested Code */}
          {finding.suggestedCode && (
            <div className="fc-section fc-section-code">
              <div className="fc-code-header">
                <div className="fc-code-title-wrap">
                  <span className="fc-code-terminal-dot" />
                  <span className="fc-code-title">Suggested Refactoring</span>
                </div>
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
