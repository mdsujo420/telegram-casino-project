import React, { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

export default function TelegramLogin({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // টেলিগ্রাম WebApp ইনিশিয়ালাইজ করো
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  const handleTelegramLogin = async () => {
    try {
      setLoading(true);
      const tg = window.Telegram?.WebApp;

      if (!tg || !tg.initData) {
        setMessage('❌ টেলিগ্রামে লগইন করতে ব্যর্থ');
        return;
      }

      const user = tg.initDataUnsafe?.user;

      if (!user) {
        setMessage('❌ টেলিগ্রাম ইউজার তথ্য পাওয়া যায়নি');
        return;
      }

      // ব্যাকএন্ডে পাঠাও
      const response = await authAPI.telegramLogin({
        telegramId: user.id.toString(),
        firstName: user.first_name,
        lastName: user.last_name || '',
        username: user.username || '',
        photoUrl: user.photo_url || '',
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setMessage('✅ লগইন সফল!');
        onLoginSuccess(response.data.user);
      }
    } catch (error) {
      setMessage('❌ লগইনে ত্রুটি: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-2">🎰</h1>
        <h2 className="text-3xl font-bold mb-2">টেলিগ্রাম ক্যাসিনো</h2>
        <p className="text-gray-400 mb-8">ক্রিপ্টো এবং BDT দিয়ে গেম খেলুন</p>

        <button
          onClick={handleTelegramLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all mb-4 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> লগইন করছে...
            </>
          ) : (
            <>
              <span>✈️</span> টেলিগ্রামে লগইন করুন
            </>
          )}
        </button>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-4">অথবা ইমেইল দিয়ে লগইন করুন:</p>
          <a href="/login" className="text-orange-500 hover:text-orange-400 font-semibold">
            ইমেইল লগইন
          </a>
        </div>
      </div>
    </div>
  );
}
