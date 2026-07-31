import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const IssueModal = ({ isOpen, onClose, book, onConfirm }) => {
  const { isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [days, setDays] = useState(14);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && isAdmin) {
      api.getUsers()
        .then((data) => {
          setUsers(data);
          if (data.length > 0) setSelectedUserId(data[0].id);
        })
        .catch((err) => console.error("Could not fetch users list:", err));
    }
  }, [isOpen, isAdmin]);

  if (!isOpen || !book) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      
      const payload = {
        book_id: book.id,
        user_id: isAdmin && selectedUserId ? parseInt(selectedUserId) : currentUser.id,
        days: parseInt(days)
      };

      await onConfirm(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to issue book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Borrow / Issue Book</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.03)' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{book.title}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Author: {book.author}</div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem' }}>
            ✓ {book.available_copies} copies available for checkout
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {isAdmin && (
            <div className="form-group">
              <label><User size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Select Member to Issue To</label>
              <select 
                className="form-control"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) - Role: {u.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Borrowing Duration (Days)</label>
            <select 
              className="form-control"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            >
              <option value={7}>7 Days (1 Week)</option>
              <option value={14}>14 Days (2 Weeks - Standard)</option>
              <option value={30}>30 Days (1 Month)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <CheckCircle size={16} />
              <span>Confirm Checkout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
