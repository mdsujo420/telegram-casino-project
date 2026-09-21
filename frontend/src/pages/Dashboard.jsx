import React, { useState } from 'react';
import WalletDisplay from '../components/WalletDisplay';
import CryptoDeposit from '../components/CryptoDeposit';
import GameInterface from '../components/GameInterface';

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('games');

  return (
    <div className="min-h-screen pb-20">
      {/* হেডার */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎰</div>
              <div>
                <h1 className="text-xl font-bold">টেলিগ্রাম ক্যাসিনো</h1>
                <p className="text-gray-400 text-sm">স্বাগতম, {user?.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="btn-secondary px-4 py-2 text-sm"
            >
              লগ আউট
            </button>
          </div>
        </div>
      </div>

      {/* মূল কন্টেন্ট */}
      <div className="max-w-6xl mx-auto p-4">
        {/* ট্যাব নেভিগেশন */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'games', name: '🎮 গেম' },
            { id: 'deposit', name: '💰 জমা করুন' },
            { id: 'wallet', name: '👛 ওয়ালেট' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* ট্যাব কন্টেন্ট */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            {activeTab === 'games' && <GameInterface />}
            {activeTab === 'deposit' && <CryptoDeposit />}
            {activeTab === 'wallet' && <WalletDisplay />}
          </div>
        </div>
      </div>

      {/* ফুটার */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>🔒 আপনার ডেটা সুরক্ষিত এবং এনক্রিপ্টেড</p>
          <p className="text-xs mt-2">দায়িত্বশীল গেমিং করুন। প্রয়োজনে সাহায্য নিন।</p>
        </div>
      </div>
    </div>
  );
}
