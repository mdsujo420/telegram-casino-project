import axios from 'axios';

// ব্যাকএন্ড লোকাল সার্ভার লিংক এখানে সেট করা হলো
const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// টোকেন ইন্টারসেপ্টর
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// অথ API
export const authAPI = {
  telegramLogin: (telegramData) => api.post('/auth/telegram-login', telegramData),
  signup: (email, password, username) => api.post('/auth/signup', { email, password, username }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

// পেমেন্ট API
export const paymentAPI = {
  generateDepositAddress: (coinType) => api.post('/payment/generate-deposit-address', { coinType }),
  deposit: (amount, coinType, txHash) => api.post('/payment/deposit', { amount, coinType, txHash }),
  withdrawal: (amount, coinType, walletAddress) => api.post('/payment/withdrawal', { amount, coinType, walletAddress }),
  getTransactions: () => api.get('/payment/transactions'),
};

// গেম API
export const gameAPI = {
  coinFlip: (betAmount, choice) => api.post('/game/coin-flip', { betAmount, choice }),
  dice: (betAmount, guess) => api.post('/game/dice', { betAmount, guess }),
  roulette: (betAmount, bet) => api.post('/game/roulette', { betAmount, bet }),
  slots: (betAmount) => api.post('/game/slots', { betAmount }),
  getGameHistory: () => api.get('/game/game-history'),
  getWalletStatus: () => api.get('/game/wallet-status'),
};

export default api;
