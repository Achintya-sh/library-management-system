import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BookCard } from '../components/BookCard';
import { BookModal } from '../components/BookModal';
import { IssueModal } from '../components/IssueModal';
import { Search, Plus, Filter, RefreshCw } from 'lucide-react';

export const Books = ({ isAddBookOpen, setIsAddBookOpen }) => {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modals
  const [editingBook, setEditingBook] = useState(null);
  const [issuingBook, setIssuingBook] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchBooks = async (query = '') => {
    try {
      setLoading(true);
      const data = await api.getBooks(query);
      setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(search);
  }, [search]);

  const handleCreateOrUpdateBook = async (bookData) => {
    if (editingBook) {
      await api.updateBook(editingBook.id, bookData);
      setNotification({ type: 'success', text: `Successfully updated "${bookData.title}"` });
    } else {
      await api.createBook(bookData);
      setNotification({ type: 'success', text: `Successfully added "${bookData.title}" to catalog` });
    }
    setEditingBook(null);
    setIsAddBookOpen(false);
    fetchBooks(search);
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book from the catalog?")) {
      try {
        await api.deleteBook(id);
        setNotification({ type: 'success', text: "Book deleted successfully" });
        fetchBooks(search);
      } catch (err) {
        setNotification({ type: 'danger', text: err.message || "Failed to delete book" });
      }
    }
  };

  const handleConfirmIssue = async (payload) => {
    await api.issueBook(payload);
    setNotification({ type: 'success', text: `Successfully checked out "${issuingBook.title}"!` });
    setIssuingBook(null);
    fetchBooks(search);
  };

  // Genre filter options
  const genres = ['All', ...new Set(books.map(b => b.genre).filter(Boolean))];
  const filteredBooks = selectedGenre === 'All' 
    ? books 
    : books.filter(b => b.genre === selectedGenre);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Book Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Explore available library books, search by title or ISBN, and check out items.
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setIsAddBookOpen(true)}>
            <Plus size={18} />
            <span>Add New Book</span>
          </button>
        )}
      </div>

      {notification && (
        <div className={`alert alert-${notification.type}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'none', color: 'inherit', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search by title, author, genre, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select 
            className="form-control" 
            value={selectedGenre} 
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{ minWidth: '140px' }}
          >
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button className="btn btn-secondary btn-sm" onClick={() => fetchBooks(search)} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Books Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading book catalog...
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No books found matching your search query.
        </div>
      ) : (
        <div className="books-grid">
          {filteredBooks.map(book => (
            <BookCard 
              key={book.id}
              book={book}
              onIssue={(b) => setIssuingBook(b)}
              onEdit={(b) => setEditingBook(b)}
              onDelete={handleDeleteBook}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <BookModal 
        isOpen={isAddBookOpen || !!editingBook}
        onClose={() => { setIsAddBookOpen(false); setEditingBook(null); }}
        onSave={handleCreateOrUpdateBook}
        initialBook={editingBook}
      />

      <IssueModal 
        isOpen={!!issuingBook}
        onClose={() => setIssuingBook(null)}
        book={issuingBook}
        onConfirm={handleConfirmIssue}
      />
    </div>
  );
};
