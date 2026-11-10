// Centralized Currency Conversion and Formatting Engine
// All internal prices, orders, and budget limits are stored in USD.

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Units of currency per 1 USD
  locale: string;
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0, locale: 'en-US' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.0, locale: 'en-IN' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, locale: 'de-DE' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79, locale: 'en-GB' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: 1.36, locale: 'en-CA' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52, locale: 'en-AU' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 155.0, locale: 'ja-JP' },
};

export const SUPPORTED_CURRENCIES = Object.values(CURRENCY_CONFIGS);

export function getExchangeRate(currency: string): number {
  return CURRENCY_CONFIGS[currency.toUpperCase()]?.rate || 1.0;
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_CONFIGS[currency.toUpperCase()]?.symbol || '$';
}

/**
 * Converts an amount stored in USD to the target currency.
 */
export function convertFromUSD(amountUSD: number, targetCurrency: string): number {
  if (typeof amountUSD !== 'number' || isNaN(amountUSD)) return 0;
  const rate = getExchangeRate(targetCurrency);
  return amountUSD * rate;
}

/**
 * Converts an amount entered in a user's selected currency back into USD.
 */
export function convertToUSD(amountInCurrency: number, sourceCurrency: string): number {
  if (typeof amountInCurrency !== 'number' || isNaN(amountInCurrency)) return 0;
  const rate = getExchangeRate(sourceCurrency);
  if (rate <= 0) return amountInCurrency;
  return amountInCurrency / rate;
}

/**
 * Primary formatting helper across the entire app.
 * Formats a USD amount according to the active or requested currency.
 */
export function formatMoney(amountUSD: number | undefined | null, currency: string = 'USD'): string {
  const numericUSD = typeof amountUSD === 'number' && !isNaN(amountUSD) ? amountUSD : 0;
  const currCode = (currency || 'USD').toUpperCase();
  const config = CURRENCY_CONFIGS[currCode] || CURRENCY_CONFIGS.USD;
  const convertedAmount = numericUSD * config.rate;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.code === 'JPY' ? 0 : 2,
      maximumFractionDigits: config.code === 'JPY' ? 0 : 2,
    }).format(convertedAmount);
  } catch {
    // Fallback if locale or code fails
    return `${config.symbol}${convertedAmount.toFixed(config.code === 'JPY' ? 0 : 2)}`;
  }
}

/**
 * Helper to get a spoken currency string for SpeechSynthesis
 * e.g. formatMoneySpoken(50, 'INR') -> "4,150 Indian Rupees"
 */
export function formatMoneySpoken(amountUSD: number, currency: string = 'USD'): string {
  const numericUSD = typeof amountUSD === 'number' && !isNaN(amountUSD) ? amountUSD : 0;
  const currCode = (currency || 'USD').toUpperCase();
  const config = CURRENCY_CONFIGS[currCode] || CURRENCY_CONFIGS.USD;
  const convertedAmount = Math.round(numericUSD * config.rate);
  return `${convertedAmount} ${config.name}s`;
}
