import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogIn, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="modal-card animate-fade-in" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-glow)' }}>
            <BookOpen size={36} color="#818cf8" />
          </div>
          <h1 style={{ fontSize: '1.8rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Athena Library
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sign in to access catalog, borrowing & issuance tracking
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
            disabled={loading}
          >
            <LogIn size={18} />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Demo Credentials Quick Selector */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Logins
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin('admin@library.org', 'admin123')}
            >
              <ShieldCheck size={14} color="#ec4899" />
              <span>Admin Demo</span>
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin('alice@example.com', 'member123')}
            >
              <UserCheck size={14} color="#818cf8" />
              <span>Member Demo</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <button 
            type="button" 
            onClick={onSwitchToRegister}
            style={{ background: 'none', color: '#818cf8', fontWeight: 600 }}
          >
            Create Account <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
