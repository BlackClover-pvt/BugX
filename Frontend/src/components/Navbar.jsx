import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Code2, Loader2, History, Sparkles } from 'lucide-react';
import AuthModal from './AuthModal';
import './Navbar.css';

export default function Navbar({ onToggleHistory }) {
  const { user, loading, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="navbar" role="banner">
        <div className="nav-brand">
          <div className="nav-logo-wrap">
            <Code2 size={18} className="nav-logo-icon" />
          </div>
          <div className="nav-brand-text">
            <span className="nav-title">BugX</span>
            <span className="nav-badge">AI</span>
          </div>
          <span className="nav-version-tag">
            <span className="nav-pulse-dot" />
            Studio
          </span>
        </div>

        <div className="nav-right">
          {loading ? (
            <div className="nav-loading">
              <Loader2 size={16} className="nav-spin" />
            </div>
          ) : user ? (
            <div className="nav-user">
              {/* History Button */}
              <button
                className="nav-history-btn"
                onClick={onToggleHistory}
                title="Review History"
                id="btn-nav-history"
                aria-label="Open review history"
              >
                <History size={14} className="nav-btn-icon" />
                <span>History</span>
              </button>

              <div className="nav-divider" />

              {/* User Profile Pill */}
              <div className="nav-user-profile" title={`Signed in as ${user.displayName}`}>
                <div className="nav-avatar">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  <span className="nav-avatar-status" />
                </div>
                <div className="nav-user-info">
                  <span className="nav-username">{user.displayName}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                className="nav-logout"
                onClick={handleLogout}
                disabled={loggingOut}
                title="Sign out of BugX"
                id="btn-nav-logout"
                aria-label="Sign out"
              >
                {loggingOut ? (
                  <Loader2 size={14} className="nav-spin" />
                ) : (
                  <LogOut size={14} />
                )}
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              className="nav-login-btn"
              onClick={() => setShowAuthModal(true)}
              id="btn-nav-login"
            >
              <Sparkles size={14} />
              <span>Get Started</span>
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
