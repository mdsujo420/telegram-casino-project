import React, { useState } from 'react';
import { paymentAPI } from '../utils/api';

export default function CryptoDeposit() {
  const [coinType, setCoinType] = useState('bitcoin');
  const [depositAddress, setDepositAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const coinTypes = [
    { id: 'bitcoin', name: '🪙 বিটকয়েন (BTC)', short: 'BTC' },
    { id: 'ethereum', name: '⟠ ইথেরিয়াম (ETH)', short: 'ETH' },
    { id: 'usdt', name: '💵 টেদার (USDT)', short: 'USDT' },
    { id: 'usdc', name: '💱 USDC', short: 'USDC' },
  ];

  const handleGenerateAddress = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.generateDepositAddress(coinType);
      if (response.data.success) {
        setDepositAddress(response.data.address);
        setMessage('✅ ঠিকানা তৈরি হয়েছে!');
      }
    } catch (error) {
      setMessage('❌ ঠিকানা তৈরিতে ব্যর্থ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || !txHash) {
      setMessage('❌ পরিমাণ এবং TX হ্যাশ প্রয়োজন');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentAPI.deposit(parseFloat(amount), coinType, txHash);
      if (response.data.success) {
        setMessage('✅ ডিপোজিট অনুরোধ পাঠানো হয়েছে!');
        setAmount('');
        setTxHash('');
      }
    } catch (error) {
      setMessage('❌ ডিপোজিটে ব্যর্থ');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <h3 className="text-2xl font-bold mb-6">💰 ক্রিপ্টো জমা করুন</h3>

      {/* কয়েন নির্বাচন */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">কয়েন নির্বাচন করুন</label>
        <div className="grid grid-cols-2 gap-3">
          {coinTypes.map((coin) => (
            <button
              key={coin.id}
              onClick={() => {
                setCoinType(coin.id);
                setDepositAddress('');
              }}
              className={`p-3 rounded-lg font-semibold transition-all ${
                coinType === coin.id
                  ? 'bg-orange-600 text-white border-2 border-orange-400'
                  : 'bg-gray-700 text-gray-300 border-2 border-transparent'
              }`}
            >
              {coin.name}
            </button>
          ))}
        </div>
      </div>

      {/* ঠিকানা জেনারেশন */}
      <div className="mb-6">
        <button
          onClick={handleGenerateAddress}
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? 'তৈরি করছে...' : 'ডিপোজিট ঠিকানা তৈরি করুন'}
        </button>
      </div>

      {/* ঠিকানা প্রদর্শন */}
      {depositAddress && (
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <p className="text-gray-400 text-sm mb-2">আপনার ডিপোজিট ঠিকানা:</p>
          <div className="flex items-center gap-2">
            <code className="text-orange-400 text-sm break-all flex-1">{depositAddress}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(depositAddress);
                setMessage('✅ কপি করা হয়েছে!');
              }}
              className="btn-secondary text-sm px-4 py-2"
            >
              📋 কপি
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            🔒 নিরাপদে এই ঠিকানায় {coinTypes.find(c => c.id === coinType)?.short} পাঠান
          </p>
        </div>
      )}

      {/* TX হ্যাশ এবং পরিমাণ */}
      {depositAddress && (
        <div className="space-y-4 mb-6">
          <input
            type="number"
            placeholder="পরিমাণ"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="TX হ্যাশ (লেনদেনের আইডি)"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            className="input-field"
          />
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'প্রক্রিয়াধীন...' : 'ডিপোজিট নিশ্চিত করুন'}
          </button>
        </div>
      )}

      {/* বার্তা */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('✅') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
