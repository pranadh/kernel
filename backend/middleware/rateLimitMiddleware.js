import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15,
  max: 500
});

export const apiLimiter = rateLimit({
  windowMs: 15,
  max: 100
});