import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// রুট ইমপোর্ট
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import gameRoutes from './routes/game.js';

// এনভায়রনমেন্ট ভেরিয়েবল লোড করো
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// মিডলওয়্যার
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB সংযোগ
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-casino')
  .then(() => console.log('✅ MongoDB সংযুক্ত হয়েছে'))
  .catch(err => console.error('❌ MongoDB সংযোগ ব্যর্থ:', err));

// হেলথ চেক
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// API রুট
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/game', gameRoutes);

// এরর হ্যান্ডলার
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong'
  });
});

// সার্ভার শুরু করো
app.listen(PORT, () => {
  console.log(`🎰 Telegram Casino Server চলছে: http://localhost:${PORT}`);
  console.log(`📡 MongoDB: ${process.env.MONGODB_URI}`);
});
