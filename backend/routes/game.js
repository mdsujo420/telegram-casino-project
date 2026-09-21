import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// ==========================================
// 🎯 MASTER HOUSE PROFIT ENGINE (10% - 30%)
// ==========================================
const MIN_PROFIT_MARGIN = 0.10; // ১০% সর্বনিম্ন প্রফিট
const MAX_PROFIT_MARGIN = 0.30; // ৩০% সর্বোচ্চ প্রফিট

// ডাইনামিক হাউজ মার্জিন ক্যালকুলেটর
const getHouseMargin = () => {
  return Math.random() * (MAX_PROFIT_MARGIN - MIN_PROFIT_MARGIN) + MIN_PROFIT_MARGIN;
};

// ইউনিভার্সাল ফেয়ারনেস ও প্রফিট ফিল্টার
const evaluateOutcome = (multiplier) => {
  const margin = getHouseMargin(); // ১০% - ৩০% এর মধ্যে একটা র্যান্ডম মার্জিন
  const winProbability = (1 - margin) / multiplier; // প্রবাবিলিটি ক্যালকুলেশন
  const isWin = Math.random() < winProbability;
  return { isWin, margin };
};

// ==========================================
// 🎮 30 ALL-IN-ONE GAME HANDLER
// ==========================================

// ১. AVIATOR & CRASH GAME LOGIC
router.post('/aviator-crash', verifyToken, async (req, res) => {
  try {
    const { betAmount, autoCashout, gameType = 'aviator' } = req.body;

    if (!betAmount || betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    const user = await User.findById(req.userId);
    if (!user || user.walletBalance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // ওয়ালেট থেকে বেট ডিডাক্ট করো
    user.walletBalance -= betAmount;
    user.totalWagered += betAmount;

    // মাস্টার প্রফিট মার্জিন অনুযায়ী ক্র্যাশ পয়েন্ট জেনারেট
    const houseMargin = getHouseMargin();
    // বেশিরভাগ সময় প্রফিট ধরে রাখতে ২.০০x এর নিচে এবং মাঝেমধ্যে হাই ক্র্যাশ পয়েন্ট
    let crashPoint = (1 + Math.random() * (1 / houseMargin)).toFixed(2);
    if (Math.random() < houseMargin) {
      crashPoint = (1.00 + Math.random() * 0.15).toFixed(2); // ১.০০ - ১.১৫ এ ইনস্ট্যান্ট ক্র্যাশ (লস গার্ড)
    }

    const targetMultiplier = autoCashout || 1.5;
    const isWin = parseFloat(crashPoint) >= parseFloat(targetMultiplier);

    let winAmount = 0;
    if (isWin) {
      winAmount = betAmount * parseFloat(targetMultiplier);
      user.walletBalance += winAmount;
      user.totalWinnings += winAmount;
    }

    const transaction = new Transaction({
      userId: user._id,
      transactionType: isWin ? 'win' : 'bet',
      amount: betAmount,
      currency: 'BDT',
      bdtEquivalent: betAmount,
      status: 'completed',
      description: `${gameType.toUpperCase()} - Target: ${targetMultiplier}x, Crashed: ${crashPoint}x - ${isWin ? 'WON' : 'LOST'}`,
      gameReference: { gameId: `${gameType}_${Date.now()}`, gameType }
    });

    await transaction.save();
    await user.save();

    res.json({
      success: true,
      gameResult: {
        gameType,
        betAmount,
        targetMultiplier,
        crashPoint,
        isWin,
        winAmount: winAmount.toFixed(2),
        newBalance: user.walletBalance.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Aviator/Crash game error' });
  }
});

// ২. MINES GAME LOGIC (বোমা বনাম হীরা)
router.post('/mines', verifyToken, async (req, res) => {
  try {
    const { betAmount, minesCount = 3, tilesOpened = 1 } = req.body;

    if (!betAmount || betAmount <= 0 || minesCount < 1 || minesCount > 24) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const user = await User.findById(req.userId);
    if (!user || user.walletBalance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    user.walletBalance -= betAmount;
    user.totalWagered += betAmount;

    // মাল্টিপ্লায়ার হিসাব
    const multiplier = 1 + (minesCount * 0.2) * tilesOpened;
    const { isWin, margin } = evaluateOutcome(multiplier);

    let winAmount = 0;
    if (isWin) {
      winAmount = betAmount * multiplier * (1 - margin);
      user.walletBalance += winAmount;
      user.totalWinnings += winAmount;
    }

    const transaction = new Transaction({
      userId: user._id,
      transactionType: isWin ? 'win' : 'bet',
      amount: betAmount,
      currency: 'BDT',
      bdtEquivalent: betAmount,
      status: 'completed',
      description: `Mines (${minesCount} mines) - ${isWin ? 'WON' : 'HIT BOMB'}`,
      gameReference: { gameId: `mines_${Date.now()}`, gameType: 'mines' }
    });

    await transaction.save();
    await user.save();

    res.json({
      success: true,
      gameResult: {
        betAmount,
        minesCount,
        isWin,
        winAmount: winAmount.toFixed(2),
        newBalance: user.walletBalance.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Mines game error' });
  }
});

// ৩. UNIVERSAL ROUTE FOR OTHER 28 GAMES
// (Plinko, Roulette, Slots, Blackjack, Baccarat, Limbo, Keno, Dragon Tiger, Towers, Goal, etc.)
router.post('/play-universal', verifyToken, async (req, res) => {
  try {
    const { betAmount, gameType, targetMultiplier = 2.0, userChoice } = req.body;

    // ৩০টি সমর্থিত গেমের সাপোর্ট লিস্ট
    const supportedGames = [
      'plinko', 'dice', 'coin_flip', 'roulette', 'slots', 'blackjack', 
      'baccarat', 'limbo', 'hilo', 'keno', 'dragon_tiger', 'wheel_of_fortune', 
      'towers', 'goal', 'triple_diamond', 'scratch_card', 'wheel_risk', 
      'sic_bo', 'red_dog', 'video_poker', 'kenopoly', 'super_dice', 
      'mega_ball', 'lucky_7', 'crypto_climb', 'speed_bet', 'bonus_slots', 'double_game'
    ];

    if (!supportedGames.includes(gameType)) {
      return res.status(400).json({ error: 'Unsupported or invalid game' });
    }

    if (!betAmount || betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    const user = await User.findById(req.userId);
    if (!user || user.walletBalance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    user.walletBalance -= betAmount;
    user.totalWagered += betAmount;

    // মাস্টার প্রফিট ফিল্টার অ্যাপ্লাই
    const { isWin, margin } = evaluateOutcome(targetMultiplier);

    let winAmount = 0;
    if (isWin) {
      winAmount = betAmount * targetMultiplier * (1 - margin);
      user.walletBalance += winAmount;
      user.totalWinnings += winAmount;
    }

    const transaction = new Transaction({
      userId: user._id,
      transactionType: isWin ? 'win' : 'bet',
      amount: betAmount,
      currency: 'BDT',
      bdtEquivalent: betAmount,
      status: 'completed',
      description: `${gameType.toUpperCase()} Game - ${isWin ? 'WON' : 'LOST'}`,
      gameReference: { gameId: `${gameType}_${Date.now()}`, gameType }
    });

    await transaction.save();
    await user.save();

    res.json({
      success: true,
      gameResult: {
        gameType,
        betAmount,
        userChoice,
        isWin,
        winAmount: winAmount.toFixed(2),
        newBalance: user.walletBalance.toFixed(2),
        houseProfitProtected: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Game execution failed' });
  }
});

// 📊 গেম ও ওয়ালেট হিস্ট্রি
router.get('/wallet-status', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      success: true,
      wallet: {
        balance: user.walletBalance,
        totalWagered: user.totalWagered,
        totalWinnings: user.totalWinnings,
        netHouseProfit: (user.totalWagered - user.totalWinnings).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

export default router;
