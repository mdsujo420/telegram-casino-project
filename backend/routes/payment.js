import express from 'express';
import axios from 'axios';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// ক্রিপ্টো রেট পান (CoinGecko API)
const getCryptoRate = async (cryptoId) => {
  try {
    const response = await axios.get(
      `${process.env.CRYPTO_API_URL}/simple/price`,
      {
        params: {
          ids: cryptoId,
          vs_currencies: 'usd'
        }
      }
    );
    return response.data[cryptoId]?.usd || 0;
  } catch (error) {
    console.error('Error fetching crypto rate:', error);
    return 0;
  }
};

// ডিপোজিট অ্যাড্রেস জেনারেট করো
router.post('/generate-deposit-address', verifyToken, async (req, res) => {
  try {
    const { coinType } = req.body;

    if (!['bitcoin', 'ethereum', 'usdt', 'usdc'].includes(coinType)) {
      return res.status(400).json({ error: 'Invalid coin type' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ডেমোর জন্য ফেক অ্যাড্রেস জেনারেট করো
    const demoAddresses = {
      bitcoin: '1A1z7agoat' + Math.random().toString(36).substring(7).toUpperCase(),
      ethereum: '0x' + Math.random().toString(16).substring(2),
      usdt: '0x' + Math.random().toString(16).substring(2),
      usdc: '0x' + Math.random().toString(16).substring(2)
    };

    const address = demoAddresses[coinType];

    // ডাটাবেসে সংরক্ষণ করো
    if (!user.cryptoAddresses) {
      user.cryptoAddresses = {};
    }
    user.cryptoAddresses[coinType] = address;
    await user.save();

    res.json({
      success: true,
      address,
      coinType,
      message: `Send ${coinType.toUpperCase()} to this address`
    });
  } catch (error) {
    console.error('Address generation error:', error);
    res.status(500).json({ error: 'Failed to generate address' });
  }
});

// ডিপোজিট রিকোয়েস্ট তৈরি করো
router.post('/deposit', verifyToken, async (req, res) => {
  try {
    const { amount, coinType, txHash } = req.body;

    if (!amount || !coinType || !txHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ক্রিপ্টো রেট পান
    const cryptoRateUSD = await getCryptoRate(
      coinType === 'bitcoin' ? 'bitcoin' :
      coinType === 'ethereum' ? 'ethereum' :
      'tether'
    );

    // USD থেকে BDT তে রূপান্তর করো
    const bdtRate = parseFloat(process.env.BDT_CONVERSION_RATE) || 120;
    const bdtAmount = amount * cryptoRateUSD * bdtRate;

    // ট্রানজেকশন তৈরি করো
    const transaction = new Transaction({
      userId: user._id,
      transactionType: 'deposit',
      amount,
      currency: coinType.toUpperCase(),
      cryptoDetails: {
        coinType,
        txHash,
        toAddress: user.cryptoAddresses?.[coinType],
        confirmations: 0,
        rate: cryptoRateUSD
      },
      bdtEquivalent: bdtAmount,
      conversionRate: cryptoRateUSD * bdtRate,
      status: 'pending',
      paymentMethod: 'crypto'
    });

    await transaction.save();

    // ব্যবহারকারীর ওয়ালেট আপডেট করো (পেন্ডিং স্ট্যাটাস)
    // নোট: আসল প্রোডাকশনে, আপনি ব্লকচেইন কনফার্মেশনের জন্য অপেক্ষা করবেন

    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        amount,
        coinType,
        bdtAmount: bdtAmount.toFixed(2),
        status: transaction.status,
        message: 'Deposit pending confirmation'
      }
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Deposit failed' });
  }
});

// ট্রানজেকশন কনফার্ম করো (ওয়েবহুক থেকে)
router.post('/confirm-deposit', async (req, res) => {
  try {
    const { txHash, confirmations } = req.body;

    if (!txHash) {
      return res.status(400).json({ error: 'TX hash required' });
    }

    const transaction = await Transaction.findOne({
      'cryptoDetails.txHash': txHash
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // যথেষ্ট কনফার্মেশন পেয়েছো?
    if (confirmations >= 3) {
      transaction.status = 'completed';
      transaction.cryptoDetails.confirmations = confirmations;
      transaction.completedAt = new Date();
      await transaction.save();

      // ইউজার ওয়ালেট আপডেট করো
      const user = await User.findById(transaction.userId);
      user.walletBalance += transaction.bdtEquivalent;
      user.totalDeposited += transaction.bdtEquivalent;
      await user.save();

      res.json({
        success: true,
        message: 'Deposit confirmed',
        bdtAmount: transaction.bdtEquivalent.toFixed(2)
      });
    } else {
      res.json({
        success: false,
        confirmations,
        message: 'Waiting for more confirmations'
      });
    }
  } catch (error) {
    console.error('Confirm deposit error:', error);
    res.status(500).json({ error: 'Confirmation failed' });
  }
});

// উইথড্রল রিকোয়েস্ট
router.post('/withdrawal', verifyToken, async (req, res) => {
  try {
    const { amount, coinType, walletAddress } = req.body;

    if (!amount || !coinType || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // ক্রিপ্টো রেট পান
    const cryptoRateUSD = await getCryptoRate(
      coinType === 'bitcoin' ? 'bitcoin' :
      coinType === 'ethereum' ? 'ethereum' :
      'tether'
    );

    const cryptoAmount = amount / (cryptoRateUSD * parseFloat(process.env.BDT_CONVERSION_RATE || 120));

    // উইথড্রল ট্রানজেকশন তৈরি করো
    const transaction = new Transaction({
      userId: user._id,
      transactionType: 'withdrawal',
      amount: cryptoAmount,
      currency: coinType.toUpperCase(),
      cryptoDetails: {
        coinType,
        fromAddress: user.cryptoAddresses?.[coinType],
        toAddress: walletAddress,
        rate: cryptoRateUSD
      },
      bdtEquivalent: amount,
      conversionRate: cryptoRateUSD * parseFloat(process.env.BDT_CONVERSION_RATE || 120),
      status: 'pending',
      paymentMethod: 'crypto'
    });

    await transaction.save();

    // তাৎক্ষণিকভাবে ওয়ালেট থেকে বাদ দাও
    user.walletBalance -= amount;
    await user.save();

    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        bdtAmount: amount.toFixed(2),
        cryptoAmount: cryptoAmount.toFixed(8),
        coinType,
        status: transaction.status,
        message: 'Withdrawal request submitted'
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

// ট্রানজেকশন হিস্ট্রি
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
