import { useState, useEffect, useCallback } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import { Sparkles, Loader2, Code2, BotMessageSquare, PartyPopper, AlertTriangle, ShieldCheck, Zap, Bug } from 'lucide-react';
import api from './api';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import SubmissionControls, { LANGUAGES } from './components/SubmissionControls';
import RiskMeter from './components/RiskMeter';
import FindingCard from './components/FindingCard';
import HistoryDrawer from './components/HistoryDrawer';
import './App.css';

// ─── Prism language loader ─────────────────────────────────────────────────────
const PRISM_LANG_MAP = {
  javascript: 'javascript', typescript: 'typescript', python: 'python',
  java: 'java', c: 'c', cpp: 'cpp', csharp: 'csharp', go: 'go', rust: 'rust',
  php: 'php', ruby: 'ruby', swift: 'swift', kotlin: 'kotlin',
  sql: 'sql', html: 'markup', css: 'css', other: 'plain',
};

async function loadPrismLang(langKey) {
  const grammar = PRISM_LANG_MAP[langKey] || 'plain';
  if (grammar === 'plain' || prism.languages[grammar]) return grammar;
  try { await import(`prismjs/components/prism-${grammar}`); } catch { /* fall back */ }
  return grammar;
}

function highlightCode(code, prismGrammar) {
  const g = prism.languages[prismGrammar] || prism.languages.plain;
  if (!g) return code;
  return prism.highlight(code, g, prismGrammar);
}

// ─── Panel State Machine ───────────────────────────────────────────────────────
const PANEL_STATE = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };

// ─── Main App ──────────────────────────────────────────────────────────────────
function CodeReviewApp() {
  const { user, loading: authLoading } = useAuth();

  // Editor state
  const [code, setCode]                         = useState(`function sum() {\n  return 1 + 1;\n}`);
  const [language, setLanguage]                 = useState('javascript');
  const [focus, setFocus]                       = useState(['GENERAL']);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [prismGrammar, setPrismGrammar]         = useState('javascript');

  // Review panel state
  const [panelState, setPanelState]         = useState(PANEL_STATE.IDLE);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [reviewData, setReviewData]         = useState(null);
  const [findings, setFindings]             = useState([]);
  const [errorMsg, setErrorMsg]             = useState('');

  // History drawer state
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    loadPrismLang(language).then(grammar => setPrismGrammar(grammar));
  }, [language]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function resetPanel() {
    setCurrentReviewId(null);
    setReviewData(null);
    setFindings([]);
    setErrorMsg('');
    setPanelState(PANEL_STATE.IDLE);
  }

  function handleCodeFromFile(text, filename, detectedLang) {
    setCode(text);
    setUploadedFileName(filename);
    setLanguage(detectedLang);
    resetPanel();
  }

  function handleClearFile() {
    setUploadedFileName(null);
    setCode('');
    resetPanel();
  }

  // ── Reopen a review from history ───────────────────────────────────────────
  function handleReopenReview(review, reopenedFindings) {
    setCode(review.codeContent ?? '');
    setLanguage(review.language ?? 'javascript');
    // Parse stored focus JSON if available
    try {
      const storedFocus = JSON.parse(review.reviewFocus ?? '["GENERAL"]');
      setFocus(Array.isArray(storedFocus) ? storedFocus : ['GENERAL']);
    } catch {
      setFocus(['GENERAL']);
    }
    setUploadedFileName(null);
    setReviewData(review);
    setFindings(reopenedFindings);
    setCurrentReviewId(review.id);
    setPanelState(PANEL_STATE.SUCCESS);
    setErrorMsg('');
  }

  // ── Submit new review ──────────────────────────────────────────────────────
  const reviewCode = useCallback(async () => {
    if (panelState === PANEL_STATE.LOADING || !code.trim()) return;
    setPanelState(PANEL_STATE.LOADING);
    setReviewData(null);
    setFindings([]);
    setErrorMsg('');
    setCurrentReviewId(null);

    try {
      const response = await api.post('/reviews', { code, language, reviewFocus: focus });
      const { review, findings: rawFindings } = response.data;
      setReviewData(review);
      setFindings(rawFindings ?? []);
      setCurrentReviewId(review.id);
      setPanelState(PANEL_STATE.SUCCESS);
    } catch (err) {
      const msg =
        err.response?.data?.details?.[0] ||
        err.response?.data?.details ||
        err.response?.data?.error ||
        err.message;
      setErrorMsg(msg);
      setPanelState(PANEL_STATE.ERROR);
    }
  }, [code, language, focus, panelState]);

  // ── Keyboard shortcut: Ctrl+Enter / Cmd+Enter to run review ────────────────
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        reviewCode();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reviewCode]);

  // ─── Splash loader ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="auth-splash-loader">
        <div className="splash-logo-wrap">
          <Code2 size={36} className="splash-logo" />
        </div>
        <div className="splash-spinner-wrap">
          <Loader2 size={20} className="splash-spinner" />
          <span>Starting BugX Studio…</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const langLabel = LANGUAGES.find(l => l.value === language)?.label ?? language;
  const isLoading = panelState === PANEL_STATE.LOADING;
  const lineCount = code ? code.split('\n').length : 0;

  // ─── Workspace ────────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      <Navbar onToggleHistory={() => setHistoryOpen(o => !o)} />

      <main className="main-content">
        {/* ─── Left: Code Editor Panel ─── */}
        <section className="panel editor-panel" aria-label="Code Input Panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon-box">
                <Code2 size={15} className="panel-icon" />
              </div>
              <span className="panel-title-text">Input Code</span>
              <span className="panel-meta-tag">{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            </div>
            <div className="panel-header-right">
              {uploadedFileName && (
                <span className="panel-file-badge" title={uploadedFileName}>
                  {uploadedFileName}
                </span>
              )}
              <span className="panel-lang-badge">{langLabel}</span>
            </div>
          </div>

          <div className="editor-wrapper">
            <Editor
              value={code}
              onValueChange={newCode => { setCode(newCode); setUploadedFileName(null); }}
              highlight={c => highlightCode(c, prismGrammar)}
              padding={16}
              className="code-editor"
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
                fontSize: 14,
                lineHeight: 1.65,
                minHeight: '100%',
              }}
            />
          </div>

          <SubmissionControls
            language={language}
            onLanguageChange={setLanguage}
            focus={focus}
            onFocusChange={setFocus}
            code={code}
            onCodeChange={handleCodeFromFile}
            uploadedFileName={uploadedFileName}
            onClearFile={handleClearFile}
          />

          <div className="editor-footer">
            <div className="editor-footer-hint">
              <kbd className="kbd-shortcut">Ctrl</kbd> + <kbd className="kbd-shortcut">Enter</kbd> to review
            </div>
            <button
              id="btn-review-code"
              onClick={reviewCode}
              disabled={isLoading || !code.trim()}
              className={`review-btn ${isLoading ? 'review-btn-loading' : ''}`}
              type="button"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="btn-spinner" />
                  <span>Analyzing Code…</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Review Code</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ─── Right: AI Review Panel ─── */}
        <section className="panel review-panel" aria-label="AI Feedback Panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon-box purple">
                <BotMessageSquare size={15} className="panel-icon purple" />
              </div>
              <span className="panel-title-text">AI Diagnostics &amp; Insights</span>
            </div>
            <div className="panel-header-right">
              {currentReviewId && !isLoading && (
                <span className="panel-review-id" title={`Review ID: ${currentReviewId}`}>
                  #{currentReviewId.slice(0, 8)}
                </span>
              )}
              {panelState === PANEL_STATE.SUCCESS && (
                <span className="panel-status-badge">
                  <span className="status-dot-green" />
                  Saved
                </span>
              )}
              {isLoading && (
                <span className="panel-status-badge panel-status-analyzing">
                  <Loader2 size={11} className="badge-spinner" />
                  Deep Analysis…
                </span>
              )}
            </div>
          </div>

          <div className="review-content">

            {/* ─── State 1: IDLE ─── */}
            {panelState === PANEL_STATE.IDLE && (
              <div className="review-empty">
                <div className="empty-icon-wrap">
                  <Sparkles size={28} />
                </div>
                <h3>Intelligent Code Inspection</h3>
                <p>
                  Paste or upload your code, choose your analysis focus, then run <strong>Review Code</strong> to perform deep static diagnostics and AI remediation.
                </p>
                <div className="empty-features-grid">
                  <div className="empty-feature-card">
                    <Bug size={14} className="feature-card-icon" />
                    <span>Logic &amp; Edge Cases</span>
                  </div>
                  <div className="empty-feature-card">
                    <ShieldCheck size={14} className="feature-card-icon" />
                    <span>Security Vulnerabilities</span>
                  </div>
                  <div className="empty-feature-card">
                    <Zap size={14} className="feature-card-icon" />
                    <span>Performance Optimizations</span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── State 2: LOADING ─── */}
            {panelState === PANEL_STATE.LOADING && (
              <div className="review-empty review-loading-state">
                <div className="loading-radar-wrap pulse-anim">
                  <div className="radar-ping" />
                  <Loader2 size={32} className="btn-spinner loading-radar-icon" />
                </div>
                <h3>Analyzing Your Code…</h3>
                <p>Evaluating AST structure, detecting security flaws, and generating actionable code fixes.</p>
                <div className="loading-steps-pills">
                  <span className="loading-pill active">Syntax &amp; Flow</span>
                  <span className="loading-pill active">Vulnerability Scan</span>
                  <span className="loading-pill">Synthesizing Fixes</span>
                </div>
              </div>
            )}

            {/* ─── State 3: ERROR ─── */}
            {panelState === PANEL_STATE.ERROR && (
              <div className="review-error">
                <div className="review-error-title">
                  <AlertTriangle size={18} className="review-error-icon" />
                  <span>Review Failed</span>
                </div>
                <p className="review-error-msg">{errorMsg}</p>
                <p className="review-error-hint">Please check that the server is operational and try again.</p>
                <button
                  className="review-error-retry"
                  onClick={reviewCode}
                  type="button"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {/* ─── State 4: SUCCESS ─── */}
            {panelState === PANEL_STATE.SUCCESS && reviewData && (
              <>
                <RiskMeter
                  overallRisk={reviewData.overallRisk ?? 'LOW'}
                  findingCount={findings.length}
                  summary={reviewData.overallSummary}
                />

                {findings.length > 0 ? (
                  <div className="findings-list">
                    <div className="findings-header">
                      <span className="findings-header-title">Diagnostic Findings</span>
                      <span className="findings-header-count">{findings.length} issues flagged</span>
                    </div>
                    {findings.map((finding, i) => (
                      <FindingCard key={finding.id ?? i} finding={finding} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="review-empty review-clean">
                    <div className="empty-icon-wrap clean-icon-wrap">
                      <PartyPopper size={30} />
                    </div>
                    <h3>Zero Defects Detected</h3>
                    <p>
                      🎉 No critical bugs, security vulnerabilities, or anti-patterns identified.
                      Your implementation is clean, robust, and production-ready!
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        </section>
      </main>

      {/* ─── History Drawer ─── */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onReopenReview={handleReopenReview}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CodeReviewApp />
    </AuthProvider>
  );
}
