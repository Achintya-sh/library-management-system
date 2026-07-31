import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, Edit, Trash2, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BookCard = ({ book, onIssue, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();
  const isAvailable = book.available_copies > 0;

  return (
    <div className="glass-panel book-card animate-fade-in">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span className="genre-tag">{book.genre || 'General'}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.location_rack || 'Main Shelf'}</span>
        </div>

        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
      </div>

      <div>
        <div className="book-meta">
          <span>ISBN: {book.isbn}</span>
          <div className={`stock-badge ${isAvailable ? 'available' : 'out-of-stock'}`}>
            {isAvailable ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span>{book.available_copies} / {book.total_copies} Left</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button 
            className={`btn btn-primary btn-sm ${!isAvailable ? 'disabled' : ''}`}
            onClick={() => onIssue(book)}
            disabled={!isAvailable}
            style={{ flex: 1, opacity: isAvailable ? 1 : 0.5 }}
          >
            <ArrowUpRight size={14} />
            <span>Borrow Book</span>
          </button>

          {isAdmin && (
            <>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onEdit(book)}
                title="Edit Details"
              >
                <Edit size={14} />
              </button>

              <button 
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(book.id)}
                title="Delete Book"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
