import React, { useState } from 'react';
import { authAPI } from '../utils/api';

export default function EmailLogin({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setMessage('✅ লগইন সফল!');
        onLoginSuccess(response.data.user);
      }
    } catch (error) {
      setMessage('❌ লগইন ব্যর্থ: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.signup(
        formData.email,
        formData.password,
        formData.username
      );

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setMessage('✅ সাইনআপ সফল!');
        onLoginSuccess(response.data.user);
      }
    } catch (error) {
      setMessage('❌ সাইনআপ ব্যর্থ: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2">🎰</h1>
        <h2 className="text-2xl font-bold text-center mb-6">
          {isSignup ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}
        </h2>

        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-sm font-semibold mb-2">ইউজারনেম</label>
              <input
                type="text"
                name="username"
                placeholder="ইউজারনেম"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">ইমেইল</label>
            <input
              type="email"
              name="email"
              placeholder="আপনার ইমেইল"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">পাসওয়ার্ড</label>
            <input
              type="password"
              name="password"
              placeholder="পাসওয়ার্ড"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'প্রক্রিয়াধীন...' : isSignup ? 'সাইনআপ করুন' : 'লগইন করুন'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm mb-3">
            {isSignup ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'অ্যাকাউন্ট নেই?'}
          </p>
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage('');
            }}
            className="text-orange-500 hover:text-orange-400 font-semibold"
          >
            {isSignup ? 'লগইন করুন' : 'সাইনআপ করুন'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <a href="/" className="text-accent hover:text-blue-400 font-semibold text-center block">
            ✈️ টেলিগ্রাম লগইনে ফিরুন
          </a>
        </div>
      </div>
    </div>
  );
}
