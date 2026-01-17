import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    name: 'Месячная подписка',
    price: '$6.99',
    interval: 'month' as const,
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_YEARLY!,
    name: 'Годовая подписка',
    price: '$49.99',
    interval: 'year' as const,
    savings: 'Экономия 40%',
  },
};
