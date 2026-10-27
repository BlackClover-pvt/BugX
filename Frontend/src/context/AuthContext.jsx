import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

// Custom hook to use auth state anywhere in the app
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // logged-in user object or null
  const [loading, setLoading] = useState(true);  // true while checking session on first load

  // On app load, check if there's an existing session
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null); // not logged in
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    return res.data;
  }

  async function register(displayName, email, password) {
    const res = await api.post('/auth/register', { displayName, email, password });
    setUser(res.data.user);
    return res.data;
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  const value = {
    user,       // current user object ({ id, displayName, email, createdAt }) or null
    loading,    // true during initial session check
    login,      // (email, password) => Promise
    register,   // (displayName, email, password) => Promise
    logout,     // () => Promise
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
