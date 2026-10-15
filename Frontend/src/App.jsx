import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Sparkles, Loader2, Code2, BotMessageSquare } from 'lucide-react';
import api from './api';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import './App.css';

function CodeReviewApp() {
  const { user, loading: authLoading } = useAuth();

  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);

  const [review, setReview] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, [code]);

  async function reviewCode() {
    if (reviewLoading) return;
    setReviewLoading(true);
    setReview("⏳ **Analyzing code with AI...** Please wait a moment.");
    try {
      const response = await api.post('/ai/get-review', { code });
      setReview(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message;
      setReview(`❌ **Review Failed**:\n\n${errorMsg}\n\n*Please verify the server is running and try again.*`);
    } finally {
      setReviewLoading(false);
    }
  }

  // 1. Initial Session Check Loading Screen
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

  // 2. Not Logged In: Show Clean & Sleek Login/Register Page
  if (!user) {
    return <AuthPage />;
  }

  // 3. Logged In: Main Code Review Workspace
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Left: Code Editor Panel */}
        <section className="panel editor-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Code2 size={16} className="panel-icon" />
              <span>Input Code</span>
            </div>
            <span className="panel-lang-badge">JavaScript</span>
          </div>

          <div className="editor-wrapper">
            <Editor
              value={code}
              onValueChange={newCode => setCode(newCode)}
              highlight={c => prism.highlight(c, prism.languages.javascript, "javascript")}
              padding={16}
              className="code-editor"
              style={{
                fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
                fontSize: 15,
                minHeight: '100%',
              }}
            />
          </div>

          <div className="editor-footer">
            <button
              onClick={reviewCode}
              disabled={reviewLoading}
              className={`review-btn ${reviewLoading ? 'review-btn-loading' : ''}`}
            >
              {reviewLoading ? (
                <>
                  <Loader2 size={16} className="btn-spinner" />
                  <span>Reviewing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Review Code</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right: AI Review Panel */}
        <section className="panel review-panel">
          <div className="panel-header">
            <div className="panel-title">
              <BotMessageSquare size={16} className="panel-icon purple" />
              <span>AI Feedback</span>
            </div>
            {review && (
              <span className="panel-status-badge">
                {reviewLoading ? 'Analyzing...' : 'Completed'}
              </span>
            )}
          </div>

          <div className="review-content">
            {review ? (
              <div className="markdown-body">
                <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
              </div>
            ) : (
              <div className="review-empty">
                <div className="empty-icon-wrap">
                  <Sparkles size={32} />
                </div>
                <h3>Ready to review your code</h3>
                <p>
                  Paste your code on the left and click <strong>Review Code</strong> to get instant AI-powered feedback, bug detection, and optimization tips.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
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
