import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';

export const BookModal = ({ isOpen, onClose, onSave, initialBook = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: 'Classic',
    total_copies: 1,
    location_rack: 'Shelf A-1'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialBook) {
      setFormData({
        title: initialBook.title || '',
        author: initialBook.author || '',
        isbn: initialBook.isbn || '',
        genre: initialBook.genre || 'General',
        total_copies: initialBook.total_copies || 1,
        location_rack: initialBook.location_rack || 'Main Shelf'
      });
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        genre: 'General',
        total_copies: 1,
        location_rack: 'Main Shelf'
      });
    }
    setError('');
  }, [initialBook, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.isbn) {
      setError('Please fill in all required fields (Title, Author, ISBN)');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>
            {initialBook ? 'Edit Book' : 'Add New Book'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Book Title *</label>
            <input 
              type="text" 
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. The Great Gatsby"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Author *</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author Name"
                required
              />
            </div>

            <div className="form-group">
              <label>ISBN Number *</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="e.g. 9780743273565"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Genre / Category</label>
              <input 
                type="text" 
                className="form-control"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="e.g. Science Fiction"
              />
            </div>

            <div className="form-group">
              <label>Total Copies</label>
              <input 
                type="number" 
                min="1"
                className="form-control"
                value={formData.total_copies}
                onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Shelf / Rack Location</label>
            <input 
              type="text" 
              className="form-control"
              value={formData.location_rack}
              onChange={(e) => setFormData({ ...formData, location_rack: e.target.value })}
              placeholder="e.g. Shelf B-2"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {initialBook ? <Save size={16} /> : <Plus size={16} />}
              <span>{initialBook ? 'Save Changes' : 'Create Book'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
