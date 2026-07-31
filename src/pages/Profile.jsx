import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, BookOpen, Key } from 'lucide-react';

export const Profile = () => {
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: 'var(--radius-full)', 
            background: 'var(--accent-gradient)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            boxShadow: 'var(--shadow-glow)'
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h1 style={{ fontSize: '1.8rem' }}>{user.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{user.email}</span>
              <span className={`role-pill ${user.role}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Account Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <User size={14} /> Full Name
              </div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <Mail size={14} /> Email Address
              </div>
              <div style={{ fontWeight: 600 }}>{user.email}</div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <Shield size={14} /> System Role
              </div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{user.role} Librarian</div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <Calendar size={14} /> Registration Date
              </div>
              <div style={{ fontWeight: 600 }}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
