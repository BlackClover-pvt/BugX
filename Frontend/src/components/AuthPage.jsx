import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Code2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import './AuthPage.css';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function switchMode(newMode) {
    setMode(newMode);
    setError('');
    setShowPassword(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (displayName.trim().length < 2) {
        setError('Display name must be at least 2 characters');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(displayName.trim(), email, password);
      }
    } catch (err) {
      const data = err.response?.data;
      let msg = '';
      if (Array.isArray(data?.details) && data.details.length > 0) {
        msg = data.details[0];
      } else if (typeof data?.details === 'string') {
        msg = data.details;
      } else if (data?.error) {
        msg = data.error;
      } else {
        msg = 'Authentication failed. Please verify your credentials.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authpage-container">
      {/* Background glow orbs */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="authpage-content">
        {/* Left: Branding & Value Proposition */}
        <div className="authpage-hero">
          <div className="authpage-brand">
            <div className="brand-icon-box">
              <Code2 size={28} className="brand-icon" />
            </div>
            <span className="brand-name">BugX</span>
            <span className="brand-tag">AI</span>
          </div>

          <h1 className="hero-headline">
            Elevate your code quality with <span className="gradient-text">AI Precision</span>.
          </h1>

          <p className="hero-subtext">
            Experience intelligent, real-time code analysis. Spot subtle bugs, security vulnerabilities, and architectural bottlenecks before they ever hit production.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon-wrap">
                <Zap size={18} />
              </div>
              <div className="feature-text">
                <strong>Instant Bug Detection</strong>
                <span>Identifies edge cases, syntax flaws, and logic bugs in seconds</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrap">
                <ShieldCheck size={18} />
              </div>
              <div className="feature-text">
                <strong>Best Practice Audit</strong>
                <span>Actionable feedback on readability, performance, and modern standards</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrap">
                <Sparkles size={18} />
              </div>
              <div className="feature-text">
                <strong>Smart AI Explanations</strong>
                <span>Clear markdown suggestions with ready-to-use refactored code</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sleek Auth Card */}
        <div className="authpage-card-wrapper">
          <div className="authpage-card">
            {/* Tab switch */}
            <div className="auth-tab-switch">
              <button
                type="button"
                className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => switchMode('signup')}
              >
                Create Account
              </button>
            </div>

            {/* Header info */}
            <div className="card-header">
              <h2>{mode === 'login' ? 'Welcome back' : 'Start your journey'}</h2>
              <p>
                {mode === 'login'
                  ? 'Sign in to access your AI code review workspace'
                  : 'Register now to unlock intelligent automated reviews'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="authpage-error">
                <span>{error}</span>
                {mode === 'signup' && error.toLowerCase().includes('already registered') && (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    style={{
                      display: 'block',
                      marginTop: '6px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-light, #a78bfa)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '13px',
                      padding: 0,
                    }}
                  >
                    Switch to Sign In →
                  </button>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="authpage-form">
              {mode === 'signup' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrap">
                    <User size={18} className="field-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Turing"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrap">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="input-wrap">
                    <Lock size={18} className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="authpage-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="btn-spinner" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Free Account'}</span>
                )}
              </button>
            </form>

            <div className="card-footer">
              <p>
                {mode === 'login' ? (
                  <>
                    New to BugX?{' '}
                    <button
                      type="button"
                      className="inline-link"
                      onClick={() => switchMode('signup')}
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="inline-link"
                      onClick={() => switchMode('login')}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
