import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { Issuances } from './pages/Issuances';
import { Profile } from './pages/Profile';

const AppContent = () => {
  const { user } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'books' | 'issuances' | 'profile'
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);

  if (!user) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
  }

  const handleOpenAddBookFromDashboard = () => {
    setActiveTab('books');
    setIsAddBookOpen(true);
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            setActiveTab={setActiveTab} 
            onOpenAddBook={handleOpenAddBookFromDashboard}
          />
        )}
        {activeTab === 'books' && (
          <Books 
            isAddBookOpen={isAddBookOpen} 
            setIsAddBookOpen={setIsAddBookOpen}
          />
        )}
        {activeTab === 'issuances' && <Issuances />}
        {activeTab === 'profile' && <Profile />}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
