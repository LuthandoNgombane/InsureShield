/**
 * quoteCalculator.js
 * Calculates premiums, base rates, and deductibles using AI risk inputs.
 */

const BASE_DAILY_RATE_PERCENT = 0.005; // 0.5% base daily rate relative to value

/**
 * Calculates insurance quote details.
 * 
 * @param {number} itemValue - Cash value of the item in USD.
 * @param {number} durationDays - Coverage duration in days.
 * @param {number} riskScore - AI Risk Score between 1 and 100.
 * @returns {Object} Calculated quote breakdown.
 */
export function calculatePremium(itemValue, durationDays, riskScore) {
  const val = Number(itemValue) || 0;
  const days = Number(durationDays) || 1;
  const score = Number(riskScore) || 50;

  // Multiplier scales from 0.8 (low risk) to 2.0 (high risk)
  const riskMultiplier = 0.8 + (score / 100) * 1.2;

  // Base calculation
  const rawPremium = val * BASE_DAILY_RATE_PERCENT * days * riskMultiplier;
  
  // Enforce a minimum policy premium floor of $5.00
  const finalPremiumUSD = Math.max(5.00, Number(rawPremium.toFixed(2)));

  // Calculate deductible (Higher risk score = slightly higher deductible %)
  const deductiblePercent = 0.05 + (score / 100) * 0.10; // 5% to 15%
  const estimatedDeductibleUSD = Math.round(val * deductiblePercent);

  return {
    itemValueUSD: val,
    durationDays: days,
    riskScore: score,
    riskMultiplier: Number(riskMultiplier.toFixed(2)),
    totalPremiumUSD: finalPremiumUSD,
    dailyRateUSD: Number((finalPremiumUSD / days).toFixed(2)),
    estimatedDeductibleUSD
  };
}