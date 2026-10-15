import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Code2, Loader2 } from 'lucide-react';
import AuthModal from './AuthModal';
import './Navbar.css';

export default function Navbar() {
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
      <nav className="navbar">
        <div className="nav-brand">
          <Code2 size={22} className="nav-logo-icon" />
          <span className="nav-title">BugX</span>
          <span className="nav-badge">AI</span>
        </div>

        <div className="nav-right">
          {loading ? (
            <div className="nav-loading">
              <Loader2 size={16} className="nav-spin" />
            </div>
          ) : user ? (
            <div className="nav-user">
              <div className="nav-avatar">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="nav-username">{user.displayName}</span>
              <button
                className="nav-logout"
                onClick={handleLogout}
                disabled={loggingOut}
                title="Logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button className="nav-login-btn" onClick={() => setShowAuthModal(true)}>
              Get Started
            </button>
          )}
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
