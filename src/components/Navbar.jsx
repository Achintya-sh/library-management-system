import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LayoutDashboard, Book, FileText, User, LogOut, Shield } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-logo">
          <BookOpen size={28} style={{ color: '#818cf8' }} />
          <span>Athena Library</span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <Book size={18} />
            <span>Catalog</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'issuances' ? 'active' : ''}`}
            onClick={() => setActiveTab('issuances')}
          >
            <FileText size={18} />
            <span>Issues & Fines</span>
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="user-badge" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
            <User size={16} color="#94a3b8" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</span>
            <span className={`role-pill ${user.role}`}>
              {isAdmin && <Shield size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />}
              {user.role}
            </span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={logout} title="Sign Out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
