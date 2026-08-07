/**
 * currencyService.js
 * Handles fetching live currency exchange rates and converting values.
 */

const EXCHANGE_API_URL = "https://open.er-api.com/v6/latest/USD";
let cachedRates = null;

/**
 * Fetches latest USD exchange rates from the API.
 * @returns {Promise<Object>} Map of currency codes to exchange rates.
 */
export async function fetchExchangeRates() {
  if (cachedRates) {
    return cachedRates;
  }

  try {
    const response = await fetch(EXCHANGE_API_URL);
    if (!response.ok) {
      throw new Error(`Currency API HTTP error: ${response.status}`);
    }

    const data = await response.json();
    if (data.result === "success") {
      cachedRates = data.rates;
      return cachedRates;
    } else {
      throw new Error("Failed to load exchange rates.");
    }
  } catch (error) {
    console.error("Currency Service Error:", error);
    // Fallback default rates if API call fails
    return { USD: 1, EUR: 0.92, GBP: 0.78, ZAR: 18.5 };
  }
}

/**
 * Converts a base USD amount to a target currency.
 * @param {number} amountInUSD - Amount in USD.
 * @param {string} targetCurrency - ISO currency code (e.g., 'EUR', 'GBP', 'ZAR').
 * @returns {Promise<number>} Converted amount rounded to 2 decimal places.
 */
export async function convertFromUSD(amountInUSD, targetCurrency = "USD") {
  const rates = await fetchExchangeRates();
  const rate = rates[targetCurrency] || 1;
  return Number((amountInUSD * rate).toFixed(2));
}