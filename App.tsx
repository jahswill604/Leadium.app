import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { PublicLayout, HomePage, AboutPage, ServicesPage, ContactPage, AuthPage } from './components/PublicPages';
import { PageView, User } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [user, setUser] = useState<User | null>(null);

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('lead_gen_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // If user loads root, go to dashboard
      // Note: In a real app we'd use URL history, here we stick to state
    }
  }, []);

  const handleAuth = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('lead_gen_user', JSON.stringify(newUser));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lead_gen_user');
    setCurrentPage('home');
  };

  // Navigation Guard: If no user, redirect dashboard requests to login
  const navigate = (page: PageView) => {
    if (page === 'dashboard' && !user) {
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

  // Render Logic
  if (user && currentPage === 'dashboard') {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <PublicLayout currentPage={currentPage} onNavigate={navigate}>
      {currentPage === 'home' && <HomePage onNavigate={navigate} />}
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'services' && <ServicesPage />}
      {currentPage === 'contact' && <ContactPage />}
      {(currentPage === 'login' || currentPage === 'signup') && (
        <AuthPage type={currentPage === 'login' ? 'login' : 'signup'} onAuth={handleAuth} />
      )}
    </PublicLayout>
  );
};

export default App;