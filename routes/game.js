import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// হাউজ এজ কনস্ট্যান্ট (%)
const HOUSE_EDGE = 2.5;

// র্যান্ডম নাম্বার জেনারেটর (০-১০০)
const generateRandomNumber = () => {
  return Math.floor(Math.random() * 101);
};

// কয়েন ফ্লিপ গেম
router.post('/coin-flip', verifyToken, async (req, res) => {
  try {
    const { betAmount, choice } = req.body; // choice: 'heads' or 'tails'

    if (!betAmount || !choice || !['heads', 'tails'].includes(choice)) {
      return res.status(400).json({ error: 'Invalid bet parameters' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.walletBalance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // বেট করো
    user.walletBalance -= betAmount;
    user.totalWagered += betAmount;

    // র্যান্ডম ফ্লিপ (৫০-৫০)
    const randomNum = generateRandomNumber();
    const result = randomNum >= 50 ? 'heads' : 'tails';
    const isWin = result === choice;

    let winAmount = 0;
    if (isWin) {
      // জিতলে ২:১ পেআউট (হাউজ এজ সহ)
      winAmount = betAmount * 2 * (1 - HOUSE_EDGE / 100);
      user.walletBalance += winAmount;
      user.totalWinnings += winAmount;
    }

    // ট্রানজেকশন রেকর্ড করো
    const transaction = new Transaction({
      userId: user._id,
      transactionType: isWin ? 'win' : 'bet',
      amount: betAmount,
      currency: 'BDT',
      bdtEquivalent: betAmount,
      conversionRate: 1,
      status: 'completed',
      description: `Coin flip - ${choice} - ${isWin ? 'WON' : 'LOST'}`,
      gameReference: {
        gameId: `coin_${Date.now()}`,
        gameType: 'coin_flip'
      }
    });

    await transaction.save();
    await user.save();

    res.json({
      success: true,
      gameResult: {
        betAmount,
        choice,
        result,
        isWin,
        winAmount: winAmount.toFixed(2),
        newBalance: user.walletBalance.toFixed(2),
        houseEdge: HOUSE_EDGE
      }
    });
  } catch (error) {
    console.error('Coin flip error:', error);
    res.status(500).json({ error: 'Game failed' });
  }
});

// ডাইস গেম (১-৬)
router.post('/dice', verifyToken, async (req, res) => {
  try {
    const { betAmount, guess } = req.body; // guess: ১-৬

    if (!betAmount || !guess || guess < 1 || guess > 6) {
      return res.status(400).json({ error: 'Invalid bet parameters' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.walletBalance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // বেট করো
    user.walletBalance -= betAmount;
    user.totalWagered += betAmount;

    // ডাইস রোল
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    const isWin = diceRoll === guess;

    let winAmount = 0;
    if (isWin) {
      // জিতলে ৬:১ পেআউট
      winAmount = betAmount * 6 * (1 - HOUSE_EDGE / 100);
      user.walletBalance += winAmount;
      user.totalWinnings += winAmount;
    }

    const transaction = new Transaction({
      userId: user._id,
      transactionType: isWin ? 'win' : 'bet',
      amount: betAmount,
      currency: 'BDT',
      bdtEquivalent: betAmount,
      conversionRate: 1,
      status: 'completed',
      description: `Dice - Guess: ${guess}, Roll: ${diceRoll} - ${isWin ? 'WON' : 'LOST'}`,
      gameReference: {
        gameId: `dice_${Date.now()}`,
        gameType: 'dice'
      }
    });

    await transaction.save();
    await user.save();

    res.json({
      success: true,
      gameResult: {
        betAmount,
        guess,
        diceRoll,
        isWin,
        winAmount: winAmount.toFixed(2),
        newBalance: user.walletBalance.toFixed(2),
        houseEdge: HOUSE_EDGE
      }
    });
  } catch (error) {
    console.error('Dice game error:', error);
    res.status(500).json({ error: 'Game failed' });
  }
});

// রুলেট গেম (০-৩৬)
router.post('/roulette', verifyToken, async (req, res) => {
  try {
    const { betAmount, bet } = req.body; // bet: {type: 'number'|'color'|'odd_even', value: ...}

    if (!betAmount || !bet) {
      return res.status(400).json({ error: 'Invalid bet parameters' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.walletBalance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    user.walletBalance -= betAmount;
    user.totalWagered += betAmount;

    // রুলেট স্পিন
    const rouletteNumber = Math.floor(Math.random() * 37); // ০-৩৬
    let isWin = false;
    let payout = 1;

    if (bet.type === 'number') {
      isWin = rouletteNumber === parseInt(bet.value);
      payout = 36;
    } else if (bet.type === 'color') {
      const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(rouletteNumber);
      isWin = (bet.value === 'red' && isRed) || (bet.value === 'black' && !isRed);
      payout = 2;
    } else if (bet.type === 'odd_even') {
      const isOdd = rouletteNumber % 2 === 1;
      isWin = (bet.value === 'odd' && isOdd) || (bet.value === 'even' && !isOdd);
      payout = 2;
    }

    let winAmount = 0;
    if (isWin) {
      winAmount = betAmount * payout * (1 - HOUSE_EDGE / 100);
      user.walletBalance += winAmount;
      user.totalWinnings += winAmount;
    }

    const transaction = new Transaction({
      userId: user._id,
      transactionType: isWin ? 'win' : 'bet',
      amount: betAmount,
      currency: 'BDT',
      bdtEquivalent: betAmount,
      conversionRate: 1,
      status: 'completed',
      description: `Roulette - Bet: ${JSON.stringify(bet)}, Result: ${rouletteNumber} - ${isWin ? 'WON' : 'LOST'}`,
      gameReference: {
        gameId: `roulette_${Date.now()}`,
        gameType: 'roulette'
      }
    });

    await transaction.save();
    await user.save();

    res.json({
      success: true,
      gameResult: {
        betAmount,
        bet,
        rouletteNumber,
        isWin,
        payout,
        winAmount: winAmount.toFixed(2),
        newBalance: user.walletBalance.toFixed(2),
        houseEdge: HOUSE_EDGE
      }
    });
  } catch (error) {
    console.error('Roulette game error:', error);
    res.status(500).json({ error: 'Game failed' });
  }
});

// স্লট মেশিন
router.post('/slots', verifyToken, async (req, res) => {
  try {
    const { betAmount } = req.body;

    if (!betAmount || betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.walletBalance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    user.walletBalance -= betAmount;
    user.totalWagered += betAmount;

    const symbols = ['🍎', '🍊', '🍋', '🍌', '🍇', '🎰'];
    const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
    const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

    let winAmount = 0;
    let multiplier = 0;

    if (reel1 === reel2 && reel2 === reel3) {
      multiplier = 10; // জ্যাকপট
      winAmount = betAmount * multiplier * (1 - HOUSE_EDGE / 100);
    } else if (reel1 === reel2 || reel2 === reel3) {
      multiplier = 2; // দুটি ম্যাচ
      winAmount = betAmount * multiplier * (1 - HOUSE_EDGE / 100);
    }

    const isWin = winAmount > 0;

    if (isWin) {
      user.walletBalance += winAmount;
      user.totalWinnings += winAmount;
    }

    const transaction = new Transaction({
      userId: user._id,
      transactionType: isWin ? 'win' : 'bet',
      amount: betAmount,
      currency: 'BDT',
      bdtEquivalent: betAmount,
      conversionRate: 1,
      status: 'completed',
      description: `Slots - ${reel1} ${reel2} ${reel3} - ${isWin ? 'WON' : 'LOST'}`,
      gameReference: {
        gameId: `slots_${Date.now()}`,
        gameType: 'slots'
      }
    });

    await transaction.save();
    await user.save();

    res.json({
      success: true,
      gameResult: {
        betAmount,
        reels: [reel1, reel2, reel3],
        isWin,
        multiplier,
        winAmount: winAmount.toFixed(2),
        newBalance: user.walletBalance.toFixed(2),
        houseEdge: HOUSE_EDGE
      }
    });
  } catch (error) {
    console.error('Slots error:', error);
    res.status(500).json({ error: 'Game failed' });
  }
});

// গেম হিস্ট্রি
router.get('/game-history', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transactions = await Transaction.find({
      userId: req.userId,
      gameReference: { $exists: true, $ne: null }
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      stats: {
        totalWagered: user.totalWagered,
        totalWinnings: user.totalWinnings,
        netProfit: user.totalWinnings - user.totalWagered,
        walletBalance: user.walletBalance
      },
      gameHistory: transactions
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game history' });
  }
});

// ওয়ালেট স্ট্যাটাস
router.get('/wallet-status', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      wallet: {
        balance: user.walletBalance,
        totalDeposited: user.totalDeposited,
        totalWithdrawn: user.totalWithdrawn,
        totalWagered: user.totalWagered,
        totalWinnings: user.totalWinnings,
        netProfit: user.totalWinnings - user.totalWagered
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet status' });
  }
});

export default router;
