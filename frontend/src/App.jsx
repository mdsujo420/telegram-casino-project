import React, { useState, useEffect } from 'react';
import TelegramLogin from './pages/TelegramLogin';
import EmailLogin from './pages/EmailLogin';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('telegram');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে ইউজার চেক করো
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('ইউজার ডেটা পার্সিং ব্যর্থ:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('telegram');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎰</div>
          <p className="text-gray-400">লোড করছে...</p>
        </div>
      </div>
    );
  }

  // লগইন করা থাকলে ড্যাশবোর্ড দেখাও
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // টেলিগ্রাম লগইন পেজ
  if (currentPage === 'telegram') {
    return (
      <TelegramLogin
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // ইমেইল লগইন পেজ
  return (
    <EmailLogin
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
