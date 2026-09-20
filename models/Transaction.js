import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['deposit', 'withdrawal', 'bet', 'win', 'bonus'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['BTC', 'ETH', 'USDT', 'USDC', 'BDT'],
    required: true
  },
  
  // ক্রিপ্টো ডিপোজিট তথ্য
  cryptoDetails: {
    coinType: String,
    txHash: String,
    fromAddress: String,
    toAddress: String,
    confirmations: Number,
    gasFee: Number,
    rate: Number // টাকায় রূপান্তর হার
  },
  
  // BDT কনভার্সন
  bdtEquivalent: {
    type: Number,
    required: true
  },
  conversionRate: {
    type: Number,
    required: true
  },
  
  // স্ট্যাটাস
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // বিস্তারিত তথ্য
  description: String,
  paymentMethod: {
    type: String,
    enum: ['crypto', 'bank', 'mobile_money'],
    default: 'crypto'
  },
  
  // গেম রেফারেন্স
  gameReference: {
    gameId: String,
    gameType: String
  },
  
  // প্রমাণ
  receiptUrl: String,
  notes: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

// ইনডেক্স
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ txHash: 1 });

export default mongoose.model('Transaction', transactionSchema);
