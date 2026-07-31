import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FileText, CheckCircle, RotateCcw, DollarSign, Filter, RefreshCw } from 'lucide-react';

export const Issuances = () => {
  const { isAdmin } = useAuth();
  const [issuances, setIssuances] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const fetchIssuances = async () => {
    try {
      setLoading(true);
      const data = await api.getIssuances();
      setIssuances(data);
    } catch (err) {
      console.error("Error fetching issuances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuances();
  }, []);

  const handleReturn = async (issuanceId, title) => {
    try {
      const res = await api.returnBook({ issuance_id: issuanceId });
      let text = `Successfully returned "${title}".`;
      if (res.fine_amount > 0) {
        text += ` Overdue fine calculated: $${res.fine_amount.toFixed(2)}.`;
      }
      setNotification({ type: 'success', text });
      fetchIssuances();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || "Failed to return book" });
    }
  };

  const handlePayFine = async (issuanceId) => {
    try {
      await api.payFine(issuanceId);
      setNotification({ type: 'success', text: "Overdue fine recorded as PAID!" });
      fetchIssuances();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || "Failed to record payment" });
    }
  };

  const filteredIssuances = statusFilter === 'All'
    ? issuances
    : issuances.filter(i => i.status === statusFilter.toLowerCase());

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Issuances & Overdue Fines Tracking</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isAdmin 
              ? "Monitor all member borrowing records, active loans, returns, and overdue fine settlements."
              : "Track your personal borrowing history, active due dates, and fine payments."}
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchIssuances}>
          <RefreshCw size={14} />
          <span>Refresh Records</span>
        </button>
      </div>

      {notification && (
        <div className={`alert alert-${notification.type}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', color: 'inherit', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['All', 'Issued', 'Overdue', 'Returned'].map(tab => (
          <button
            key={tab}
            className={`btn btn-sm ${statusFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading issuance records...
        </div>
      ) : filteredIssuances.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No borrowing records match the selected filter.
        </div>
      ) : (
        <div className="glass-panel table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Book Details</th>
                {isAdmin && <th>Borrower</th>}
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Fine Balance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssuances.map(item => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{item.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.book_title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>by {item.book_author}</div>
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.user_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.user_email}</div>
                    </td>
                  )}
                  <td>{item.issue_date}</td>
                  <td style={{ fontWeight: item.status === 'overdue' ? 700 : 400, color: item.status === 'overdue' ? 'var(--status-danger)' : 'inherit' }}>
                    {item.due_date}
                  </td>
                  <td>{item.return_date || '—'}</td>
                  <td>
                    <span className={`status-pill ${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.fine_amount > 0 ? (
                      <div>
                        <span style={{ color: 'var(--status-danger)', fontWeight: 700 }}>
                          ${item.fine_amount.toFixed(2)}
                        </span>
                        <div style={{ fontSize: '0.75rem', marginTop: 2 }}>
                          {item.fine_paid ? (
                            <span style={{ color: 'var(--status-success)' }}>✓ Settled</span>
                          ) : (
                            <span style={{ color: 'var(--status-warning)' }}>Unpaid</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>$0.00</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {item.status !== 'returned' && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleReturn(item.id, item.book_title)}
                          title="Return Book to Inventory"
                        >
                          <RotateCcw size={14} />
                          <span>Return</span>
                        </button>
                      )}

                      {item.fine_amount > 0 && !item.fine_paid && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handlePayFine(item.id)}
                          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        >
                          <DollarSign size={14} />
                          <span>Pay Fine</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
