// src/utils/helpers.js
import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

export const generateSaleCode = () => {
  return `V${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
};
