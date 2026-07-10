// currencies.js — static metadata: currency code -> { name, countryCode }
// countryCode is the ISO 3166 two-letter code used by flagcdn.com for flags.
// For currencies without a single issuing country (e.g. EUR), a representative
// country/region flag is used.

export const CURRENCY_META = {
  USD: { name: 'US Dollar', countryCode: 'us' },
  EUR: { name: 'Euro', countryCode: 'eu' },
  GBP: { name: 'British Pound', countryCode: 'gb' },
  JPY: { name: 'Japanese Yen', countryCode: 'jp' },
  AUD: { name: 'Australian Dollar', countryCode: 'au' },
  CAD: { name: 'Canadian Dollar', countryCode: 'ca' },
  CHF: { name: 'Swiss Franc', countryCode: 'ch' },
  CNY: { name: 'Chinese Yuan', countryCode: 'cn' },
  INR: { name: 'Indian Rupee', countryCode: 'in' },
  NZD: { name: 'New Zealand Dollar', countryCode: 'nz' },
  SGD: { name: 'Singapore Dollar', countryCode: 'sg' },
  HKD: { name: 'Hong Kong Dollar', countryCode: 'hk' },
  SEK: { name: 'Swedish Krona', countryCode: 'se' },
  NOK: { name: 'Norwegian Krone', countryCode: 'no' },
  MXN: { name: 'Mexican Peso', countryCode: 'mx' },
  ZAR: { name: 'South African Rand', countryCode: 'za' },
  BRL: { name: 'Brazilian Real', countryCode: 'br' },
  KRW: { name: 'South Korean Won', countryCode: 'kr' },
  TRY: { name: 'Turkish Lira', countryCode: 'tr' },
  AED: { name: 'UAE Dirham', countryCode: 'ae' },
};

// Fixed "Popular" set shown at the top of the picker, in this order.
export const POPULAR_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];

export function flagUrl(countryCode, size = '24x18') {
  return `https://flagcdn.com/${size}/${countryCode}.png`;
}

/**
 * Merge Frankfurter's live currency list (code -> full name) with our
 * flag/country metadata, falling back gracefully for any currency we
 * don't have a mapping for.
 */
export function buildCurrencyList(apiCurrencies) {
  return Object.entries(apiCurrencies).map(([code, name]) => {
    const meta = CURRENCY_META[code];
    return {
      code,
      name: meta?.name ?? name,
      countryCode: meta?.countryCode ?? code.slice(0, 2).toLowerCase(),
    };
  });
}