import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose }) {
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

  if (!isOpen) return null;

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
      // Success — close modal and reset form
      resetForm();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.details?.[0] ||
        err.response?.data?.error ||
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setDisplayName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      resetForm();
      onClose();
    }
  }

  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        {/* Close button */}
        <button className="auth-close" onClick={() => { resetForm(); onClose(); }}>
          <X size={20} />
        </button>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Error message */}
        {error && <div className="auth-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Display Name (signup only) */}
          {mode === 'signup' && (
            <div className="auth-field">
              <User size={18} className="auth-icon" />
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          {/* Email */}
          <div className="auth-field">
            <Mail size={18} className="auth-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <Lock size={18} className="auth-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <div className="auth-field">
              <Lock size={18} className="auth-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Submit button */}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <><Loader2 size={18} className="auth-spinner" /> Please wait...</>
            ) : (
              mode === 'login' ? 'Login' : 'Create Account'
            )}
          </button>
        </form>

        {/* Footer toggle */}
        <p className="auth-footer">
          {mode === 'login' ? (
            <>Don't have an account? <span onClick={() => switchMode('signup')}>Sign Up</span></>
          ) : (
            <>Already have an account? <span onClick={() => switchMode('login')}>Login</span></>
          )}
        </p>
      </div>
    </div>
  );
}
