import { useRef } from 'react';
import { Upload, FileCode, X } from 'lucide-react';
import './SubmissionControls.css';

// ─── Language Config ──────────────────────────────────────────────────────────

export const LANGUAGES = [
  { value: 'javascript',  label: 'JavaScript',  ext: ['.js', '.mjs', '.cjs'] },
  { value: 'typescript',  label: 'TypeScript',  ext: ['.ts', '.tsx'] },
  { value: 'python',      label: 'Python',      ext: ['.py'] },
  { value: 'java',        label: 'Java',        ext: ['.java'] },
  { value: 'c',           label: 'C',           ext: ['.c', '.h'] },
  { value: 'cpp',         label: 'C++',         ext: ['.cpp', '.cc', '.cxx', '.hpp'] },
  { value: 'csharp',      label: 'C#',          ext: ['.cs'] },
  { value: 'go',          label: 'Go',          ext: ['.go'] },
  { value: 'rust',        label: 'Rust',        ext: ['.rs'] },
  { value: 'php',         label: 'PHP',         ext: ['.php'] },
  { value: 'ruby',        label: 'Ruby',        ext: ['.rb'] },
  { value: 'swift',       label: 'Swift',       ext: ['.swift'] },
  { value: 'kotlin',      label: 'Kotlin',      ext: ['.kt', '.kts'] },
  { value: 'sql',         label: 'SQL',         ext: ['.sql'] },
  { value: 'html',        label: 'HTML',        ext: ['.html', '.htm'] },
  { value: 'css',         label: 'CSS',         ext: ['.css', '.scss', '.sass'] },
  { value: 'other',       label: 'Other',       ext: [] },
];

// ─── Focus Config ─────────────────────────────────────────────────────────────

export const FOCUS_OPTIONS = [
  { value: 'CORRECTNESS',  label: 'Correctness',  icon: '🐛' },
  { value: 'SECURITY',     label: 'Security',     icon: '🔒' },
  { value: 'PERFORMANCE',  label: 'Performance',  icon: '⚡' },
  { value: 'READABILITY',  label: 'Readability',  icon: '📖' },
  { value: 'GENERAL',      label: 'General',      icon: '🔍' },
];

// ─── Byte counter color ───────────────────────────────────────────────────────

function counterColor(bytes, max) {
  const pct = bytes / max;
  if (pct >= 0.9) return 'counter-red';
  if (pct >= 0.65) return 'counter-amber';
  return 'counter-green';
}

function formatBytes(n) {
  return n.toLocaleString();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubmissionControls({
  language,
  onLanguageChange,
  focus,
  onFocusChange,
  code,
  onCodeChange,
  uploadedFileName,
  onClearFile,
}) {
  const MAX_BYTES = 10_240;
  const byteCount = new TextEncoder().encode(code).length;
  const fileInputRef = useRef(null);

  // Auto-detect language from file extension
  function detectLanguage(filename) {
    const ext = '.' + filename.split('.').pop().toLowerCase();
    const match = LANGUAGES.find(l => l.ext.includes(ext));
    return match ? match.value : 'other';
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      onCodeChange(text, file.name, detectLanguage(file.name));
    };
    reader.readAsText(file);
    // Reset so same file can be re-uploaded
    e.target.value = '';
  }

  function toggleFocus(val) {
    if (focus.includes(val)) {
      // Keep at least one selected
      if (focus.length === 1) return;
      onFocusChange(focus.filter(f => f !== val));
    } else {
      onFocusChange([...focus, val]);
    }
  }

  const colorClass = counterColor(byteCount, MAX_BYTES);

  return (
    <div className="sc-root">

      {/* ── Top row: Language selector + File upload ── */}
      <div className="sc-row sc-row-top">

        {/* Language Dropdown */}
        <div className="sc-field">
          <label className="sc-label" htmlFor="lang-select">Language</label>
          <div className="sc-select-wrap">
            <select
              id="lang-select"
              className="sc-select"
              value={language}
              onChange={e => onLanguageChange(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* File Upload */}
        <div className="sc-field sc-field-upload">
          <label className="sc-label">File Upload</label>
          <div className="sc-upload-row">
            {uploadedFileName ? (
              <div className="sc-file-chip">
                <FileCode size={13} />
                <span className="sc-file-name">{uploadedFileName}</span>
                <button
                  className="sc-file-clear"
                  onClick={onClearFile}
                  title="Clear file"
                  id="btn-clear-file"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                className="sc-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                id="btn-upload-file"
              >
                <Upload size={13} />
                <span>Upload file</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".js,.mjs,.cjs,.ts,.tsx,.py,.java,.c,.h,.cpp,.cc,.cxx,.hpp,.cs,.go,.rs,.php,.rb,.swift,.kt,.kts,.sql,.html,.htm,.css,.scss,.sass,.txt,.md"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              id="file-input"
            />
          </div>
        </div>

        {/* Byte Counter */}
        <div className="sc-field sc-field-counter">
          <label className="sc-label">Code Size</label>
          <div className={`sc-counter ${colorClass}`}>
            <span className="sc-counter-val">{formatBytes(byteCount)}</span>
            <span className="sc-counter-sep"> / </span>
            <span className="sc-counter-max">{formatBytes(MAX_BYTES)} bytes</span>
            <span className="sc-counter-pct">({Math.round((byteCount / MAX_BYTES) * 100)}%)</span>
          </div>
          <div className="sc-counter-bar-bg">
            <div
              className={`sc-counter-bar-fill ${colorClass}`}
              style={{ width: `${Math.min((byteCount / MAX_BYTES) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Focus chips ── */}
      <div className="sc-row sc-row-focus">
        <span className="sc-label">Review Focus</span>
        <div className="sc-chips">
          {FOCUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              id={`focus-chip-${opt.value.toLowerCase()}`}
              className={`sc-chip ${focus.includes(opt.value) ? 'sc-chip-active' : ''}`}
              onClick={() => toggleFocus(opt.value)}
            >
              <span className="sc-chip-icon">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── External provider notice ── */}
      <div className="sc-notice">
        <span className="sc-notice-icon">🔗</span>
        <span>
          Your code is securely sent to <strong>Google Gemini</strong> for AI analysis.
          Avoid submitting sensitive credentials or private keys.
        </span>
      </div>

    </div>
  );
}
