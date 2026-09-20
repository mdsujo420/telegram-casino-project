import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    unique: true,
    sparse: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  passwordHash: {
    type: String,
    sparse: true
  },
  walletBalance: {
    type: Number,
    default: 0,
    currency: 'BDT'
  },
  totalDeposited: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  totalWagered: {
    type: Number,
    default: 0
  },
  totalWinnings: {
    type: Number,
    default: 0
  },
  cryptoAddresses: {
    bitcoin: String,
    ethereum: String,
    usdt: String,
    usdc: String
  },
  authMethod: {
    type: String,
    enum: ['telegram', 'email', 'web'],
    default: 'telegram'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  gameHistory: [
    {
      gameId: String,
      betAmount: Number,
      winAmount: Number,
      playedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  preferences: {
    language: {
      type: String,
      default: 'bn'
    },
    currency: {
      type: String,
      default: 'BDT'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000 // 90 দিন পর অটো ডিলিট (নিষ্ক্রিয় অ্যাকাউন্ট)
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// TTL ইনডেক্স - ৯০ দিন পর স্বয়ংক্রিয় ডিলিট
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('User', userSchema);
