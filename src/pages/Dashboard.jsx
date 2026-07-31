import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatsCard } from '../components/StatsCard';
import { Book, Users, Clock, AlertTriangle, DollarSign, PlusCircle, BookOpen, CheckCircle } from 'lucide-react';

export const Dashboard = ({ setActiveTab, onOpenAddBook }) => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentIssuances, setRecentIssuances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, issuancesData] = await Promise.all([
          api.getStats(),
          api.getIssuances()
        ]);
        setStats(statsData);
        setRecentIssuances(issuancesData.slice(0, 5));
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        Loading library system dashboard...
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid var(--border-glow)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Welcome back, {user.name}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
          {isAdmin 
            ? "Library Admin Dashboard — monitor book inventory, process borrower issuances, and manage overdue fine balances." 
            : "Member Overview — search the catalog, view your active book checkouts, and check return deadlines."}
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('books')}>
            <BookOpen size={18} />
            <span>Browse Catalog</span>
          </button>

          {isAdmin && (
            <button className="btn btn-secondary" onClick={onOpenAddBook}>
              <PlusCircle size={18} />
              <span>Add New Book</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <StatsCard 
          title="Total Books in Catalog" 
          value={stats?.total_books || 0} 
          icon={<Book size={24} />} 
          color="#6366f1"
        />

        {isAdmin ? (
          <>
            <StatsCard 
              title="Registered Members" 
              value={stats?.total_members || 0} 
              icon={<Users size={24} />} 
              color="#3b82f6"
            />
            <StatsCard 
              title="Active Issued Loans" 
              value={stats?.active_loans || 0} 
              icon={<Clock size={24} />} 
              color="#06b6d4"
            />
            <StatsCard 
              title="Overdue Issuances" 
              value={stats?.overdue_loans || 0} 
              icon={<AlertTriangle size={24} />} 
              color="#ef4444"
            />
          </>
        ) : (
          <>
            <StatsCard 
              title="Available Copies" 
              value={stats?.available_copies || 0} 
              icon={<CheckCircle size={24} />} 
              color="#10b981"
            />
            <StatsCard 
              title="My Borrowed Books" 
              value={stats?.my_active_loans || 0} 
              icon={<Clock size={24} />} 
              color="#06b6d4"
            />
            <StatsCard 
              title="My Overdue Fines" 
              value={`$${(stats?.my_total_fines || 0).toFixed(2)}`} 
              icon={<DollarSign size={24} />} 
              color={stats?.my_total_fines > 0 ? "#ef4444" : "#10b981"}
            />
          </>
        )}
      </div>

      {/* Recent Issuances Section */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2>{isAdmin ? 'Recent Book Checkouts' : 'My Active Borrowings'}</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('issuances')}>
            View All Issues
          </button>
        </div>

        {recentIssuances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No active book issuances found. Browse the catalog to check out books!
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  {isAdmin && <th>Borrower</th>}
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody>
                {recentIssuances.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.book_title}</td>
                    {isAdmin && <td>{item.user_name} ({item.user_email})</td>}
                    <td>{item.issue_date}</td>
                    <td>{item.due_date}</td>
                    <td>
                      <span className={`status-pill ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ color: item.fine_amount > 0 ? 'var(--status-danger)' : 'var(--text-muted)' }}>
                      ${item.fine_amount.toFixed(2)} {item.fine_paid ? '(Paid)' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
