import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, ArrowLeft, Shield, User } from 'lucide-react';

export const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name, email, password, role);
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="modal-card animate-fade-in" style={{ maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-glow)' }}>
            <BookOpen size={36} color="#c084fc" />
          </div>
          <h1 style={{ fontSize: '1.8rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Join Athena Library to borrow books and manage your loans
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control"
              placeholder="john@example.com"
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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                className={`btn ${role === 'member' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('member')}
                style={{ padding: '0.65rem' }}
              >
                <User size={16} />
                <span>Member</span>
              </button>

              <button
                type="button"
                className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('admin')}
                style={{ padding: '0.65rem' }}
              >
                <Shield size={16} />
                <span>Librarian Admin</span>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
            disabled={loading}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already registered?{' '}
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            style={{ background: 'none', color: '#818cf8', fontWeight: 600 }}
          >
            <ArrowLeft size={14} style={{ verticalAlign: 'middle' }} /> Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
