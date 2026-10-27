import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import { Sparkles, Loader2, Code2, BotMessageSquare, PartyPopper } from 'lucide-react';
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
  async function reviewCode() {
    if (panelState === PANEL_STATE.LOADING) return;
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
  }

  // ─── Splash loader ────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="auth-splash-loader">
        <div className="splash-logo-wrap">
          <Code2 size={36} className="splash-logo" />
        </div>
        <div className="splash-spinner-wrap">
          <Loader2 size={24} className="splash-spinner" />
          <span>Starting BugX...</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const langLabel = LANGUAGES.find(l => l.value === language)?.label ?? language;
  const isLoading = panelState === PANEL_STATE.LOADING;

  // ─── Workspace ────────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      <Navbar onToggleHistory={() => setHistoryOpen(o => !o)} />

      <main className="main-content">
        {/* ─── Left: Code Editor Panel ─── */}
        <section className="panel editor-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Code2 size={16} className="panel-icon" />
              <span>Input Code</span>
            </div>
            <span className="panel-lang-badge">{langLabel}</span>
          </div>

          <div className="editor-wrapper">
            <Editor
              value={code}
              onValueChange={newCode => { setCode(newCode); setUploadedFileName(null); }}
              highlight={c => highlightCode(c, prismGrammar)}
              padding={16}
              className="code-editor"
              style={{
                fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
                fontSize: 15,
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
            <button
              id="btn-review-code"
              onClick={reviewCode}
              disabled={isLoading || !code.trim()}
              className={`review-btn ${isLoading ? 'review-btn-loading' : ''}`}
            >
              {isLoading ? (
                <><Loader2 size={16} className="btn-spinner" /><span>Reviewing...</span></>
              ) : (
                <><Sparkles size={16} /><span>Review Code</span></>
              )}
            </button>
          </div>
        </section>

        {/* ─── Right: AI Review Panel ─── */}
        <section className="panel review-panel">
          <div className="panel-header">
            <div className="panel-title">
              <BotMessageSquare size={16} className="panel-icon purple" />
              <span>AI Feedback</span>
            </div>
            <div className="panel-header-right">
              {currentReviewId && !isLoading && (
                <span className="panel-review-id" title={`Review ID: ${currentReviewId}`}>
                  #{currentReviewId.slice(0, 8)}
                </span>
              )}
              {panelState === PANEL_STATE.SUCCESS && (
                <span className="panel-status-badge">Saved</span>
              )}
              {isLoading && (
                <span className="panel-status-badge panel-status-analyzing">Analyzing...</span>
              )}
            </div>
          </div>

          <div className="review-content">

            {panelState === PANEL_STATE.IDLE && (
              <div className="review-empty">
                <div className="empty-icon-wrap">
                  <Sparkles size={32} />
                </div>
                <h3>Ready to review your code</h3>
                <p>
                  Paste your code on the left, pick a language &amp; focus, then click{' '}
                  <strong>Review Code</strong> to get instant AI-powered feedback.
                  Open <strong>History</strong> in the navbar to revisit past reviews.
                </p>
              </div>
            )}

            {panelState === PANEL_STATE.LOADING && (
              <div className="review-empty">
                <div className="empty-icon-wrap pulse-anim">
                  <Loader2 size={32} className="btn-spinner" />
                </div>
                <h3>Analyzing your code…</h3>
                <p>Our AI is carefully reviewing for bugs, security issues, and improvements.</p>
              </div>
            )}

            {panelState === PANEL_STATE.ERROR && (
              <div className="review-error">
                <div className="review-error-title">❌ Review Failed</div>
                <p className="review-error-msg">{errorMsg}</p>
                <p className="review-error-hint">Please check the server is running and try again.</p>
              </div>
            )}

            {panelState === PANEL_STATE.SUCCESS && reviewData && (
              <>
                <RiskMeter
                  overallRisk={reviewData.overallRisk ?? 'LOW'}
                  findingCount={findings.length}
                  summary={reviewData.overallSummary}
                />

                {findings.length > 0 ? (
                  <div className="findings-list">
                    {findings.map((finding, i) => (
                      <FindingCard key={finding.id ?? i} finding={finding} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="review-empty review-clean">
                    <div className="empty-icon-wrap clean-icon-wrap">
                      <PartyPopper size={32} />
                    </div>
                    <h3>Clean Code!</h3>
                    <p>
                      🎉 No critical issues or security defects identified.
                      Your code looks solid — great work!
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        </section>
      </main>

      {/* ─── History Drawer (portal-like overlay) ─── */}
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
