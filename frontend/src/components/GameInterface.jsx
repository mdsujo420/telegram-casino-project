import React, { useState } from 'react';
import { gameAPI } from '../utils/api';

export default function GameInterface() {
  const [activeGame, setActiveGame] = useState('coinflip');
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  // কয়েন ফ্লিপ গেম
  const playCoinFlip = async (choice) => {
    if (!betAmount) {
      setMessage('❌ বাজির পরিমাণ প্রবেশ করুন');
      return;
    }

    setLoading(true);
    try {
      const response = await gameAPI.coinFlip(parseFloat(betAmount), choice);
      if (response.data.success) {
        setResult(response.data.gameResult);
        setMessage(response.data.gameResult.isWin ? '🎉 আপনি জিতেছেন!' : '😢 আপনি হেরেছেন');
        setBetAmount('');
      }
    } catch (error) {
      setMessage('❌ গেম ব্যর্থ হয়েছে');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ডাইস গেম
  const playDice = async (guess) => {
    if (!betAmount) {
      setMessage('❌ বাজির পরিমাণ প্রবেশ করুন');
      return;
    }

    setLoading(true);
    try {
      const response = await gameAPI.dice(parseFloat(betAmount), guess);
      if (response.data.success) {
        setResult(response.data.gameResult);
        setMessage(response.data.gameResult.isWin ? '🎉 আপনি জিতেছেন!' : '😢 আপনি হেরেছেন');
        setBetAmount('');
      }
    } catch (error) {
      setMessage('❌ গেম ব্যর্থ হয়েছে');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // স্লট গেম
  const playSlots = async () => {
    if (!betAmount) {
      setMessage('❌ বাজির পরিমাণ প্রবেশ করুন');
      return;
    }

    setLoading(true);
    try {
      const response = await gameAPI.slots(parseFloat(betAmount));
      if (response.data.success) {
        setResult(response.data.gameResult);
        setMessage(response.data.gameResult.isWin ? '🎉 আপনি জিতেছেন!' : '😢 আপনি হেরেছেন');
        setBetAmount('');
      }
    } catch (error) {
      setMessage('❌ গেম ব্যর্থ হয়েছে');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const quickBets = [100, 500, 1000, 5000];

  return (
    <div className="space-y-6">
      {/* গেম ট্যাব */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'coinflip', name: '🪙 কয়েন ফ্লিপ' },
          { id: 'dice', name: '🎲 ডাইস' },
          { id: 'roulette', name: '🎡 রুলেট' },
          { id: 'slots', name: '🎰 স্লট' },
        ].map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeGame === game.id
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {game.name}
          </button>
        ))}
      </div>

      {/* গেম প্যানেল */}
      <div className="card">
        {activeGame === 'coinflip' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">🪙 কয়েন ফ্লিপ</h3>
            <p className="text-gray-400 mb-6">মাথা বা পুচ্ছ নির্বাচন করুন - ৫০% জেতার সম্ভাবনা</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => playCoinFlip('heads')}
                disabled={loading}
                className="btn-primary py-6 text-lg"
              >
                {loading ? 'খেলছে...' : '🪙 মাথা'}
              </button>
              <button
                onClick={() => playCoinFlip('tails')}
                disabled={loading}
                className="btn-primary py-6 text-lg"
              >
                {loading ? 'খেলছে...' : '🪙 পুচ্ছ'}
              </button>
            </div>
          </div>
        )}

        {activeGame === 'dice' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">🎲 ডাইস গেম</h3>
            <p className="text-gray-400 mb-6">১-৬ এর মধ্যে একটি নাম্বার চয়ন করুন</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => playDice(num)}
                  disabled={loading}
                  className="btn-primary py-4 text-lg font-bold"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeGame === 'slots' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">🎰 স্লট মেশিন</h3>
            <p className="text-gray-400 mb-6">স্পিন করুন এবং জ্যাকপট জিতুন!</p>
            <button
              onClick={playSlots}
              disabled={loading}
              className="w-full btn-primary py-6 text-lg font-bold"
            >
              {loading ? 'স্পিন করছে...' : '🎰 স্পিন করুন'}
            </button>
            {result?.reels && activeGame === 'slots' && (
              <div className="mt-6 text-center">
                <div className="text-6xl mb-4">{result.reels.join(' ')}</div>
                {result.isWin && <p className="text-2xl font-bold text-green-400">🎉 জ্যাকপট!</p>}
              </div>
            )}
          </div>
        )}

        {activeGame === 'roulette' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">🎡 রুলেট</h3>
            <p className="text-gray-400 mb-4">আসছে শীঘ্রই...</p>
          </div>
        )}
      </div>

      {/* বাজির পরিমাণ ইনপুট */}
      <div className="card">
        <label className="block text-sm font-semibold mb-3">বাজির পরিমাণ (৳)</label>
        <input
          type="number"
          placeholder="পরিমাণ প্রবেশ করুন"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="input-field mb-4"
        />
        <div className="grid grid-cols-4 gap-2">
          {quickBets.map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount.toString())}
              className="btn-secondary text-sm py-2"
            >
              ৳{amount}
            </button>
          ))}
        </div>
      </div>

      {/* ফলাফল */}
      {result && (
        <div className={`card border-2 ${result.isWin ? 'border-green-500' : 'border-red-500'}`}>
          <h4 className="text-lg font-bold mb-4">🎮 গেমের ফলাফল</h4>
          <div className="space-y-2 text-sm">
            <p>বাজির পরিমাণ: <span className="font-bold">৳{result.betAmount}</span></p>
            {result.winAmount > 0 && (
              <p>জেতার পরিমাণ: <span className="font-bold text-green-400">৳{result.winAmount}</span></p>
            )}
            <p>নতুন ব্যালেন্স: <span className="font-bold">৳{result.newBalance}</span></p>
          </div>
        </div>
      )}

      {/* বার্তা */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('✅') || message.includes('🎉')
            ? 'bg-green-900 text-green-200'
            : 'bg-red-900 text-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
