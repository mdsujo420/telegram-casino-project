import React, { useState, useEffect } from 'react';
import { gameAPI } from '../utils/api';

export default function WalletDisplay() {
  const [wallet, setWallet] = useState({
    balance: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalWagered: 0,
    totalWinnings: 0,
    netProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletStatus();
    // প্রতি ৩ সেকেন্ডে আপডেট করো
    const interval = setInterval(fetchWalletStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchWalletStatus = async () => {
    try {
      const response = await gameAPI.getWalletStatus();
      if (response.data.success) {
        setWallet(response.data.wallet);
      }
    } catch (error) {
      console.error('ওয়ালেট ডেটা লোড করতে ব্যর্থ:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <div className="text-center mb-6">
        <h2 className="text-gray-400 text-sm mb-2">আপনার ওয়ালেট ব্যালেন্স</h2>
        <div className="text-5xl font-bold text-orange-500">
          ৳ {wallet.balance.toFixed(2)}
        </div>
        <p className="text-gray-500 text-xs mt-1">বাংলাদেশি টাকা (BDT)</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-400">লোড করছে...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">মোট জমা</p>
            <p className="text-green-400 font-bold">৳ {wallet.totalDeposited.toFixed(2)}</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">মোট তোলা</p>
            <p className="text-red-400 font-bold">৳ {wallet.totalWithdrawn.toFixed(2)}</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">মোট বাজি</p>
            <p className="text-blue-400 font-bold">৳ {wallet.totalWagered.toFixed(2)}</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">মোট জিতেছেন</p>
            <p className="text-green-400 font-bold">৳ {wallet.totalWinnings.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">নেট মুনাফা</span>
          <span className={`font-bold text-lg ${wallet.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {wallet.netProfit >= 0 ? '+' : ''}৳ {wallet.netProfit.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
