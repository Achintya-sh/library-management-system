const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.detail || 'An error occurred while communicating with the server');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  getUsers: () => request('/auth/users'),

  // Books
  getBooks: (search = '') => request(`/books${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getBook: (id) => request(`/books/${id}`),
  createBook: (bookData) => request('/books', { method: 'POST', body: JSON.stringify(bookData) }),
  updateBook: (id, bookData) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(bookData) }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  // Issuances & Fines
  getIssuances: () => request('/issuances'),
  issueBook: (data) => request('/issuances/issue', { method: 'POST', body: JSON.stringify(data) }),
  returnBook: (data) => request('/issuances/return', { method: 'POST', body: JSON.stringify(data) }),
  payFine: (id) => request(`/issuances/${id}/pay-fine`, { method: 'POST' }),
  getStats: () => request('/issuances/stats')
};
