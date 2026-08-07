/**
 * uiRenderer.js
 * Renders UI components, dynamic output cards, and status messages.
 */

/**
 * Displays a loading state inside a container.
 * @param {HTMLElement} containerElement 
 * @param {string} message 
 */
export function renderLoading(containerElement, message = "Analyzing with AI...") {
  containerElement.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Renders the AI Risk Assessment and Quote preview card.
 * @param {HTMLElement} containerElement 
 * @param {Object} assessment - Output from aiRiskService.js
 * @param {Object} quote - Output from quoteCalculator.js
 * @param {string} currencySymbol - Active currency symbol
 */
export function renderQuoteResult(containerElement, assessment, quote, currencySymbol = "$") {
  const tierClass = assessment.risk_tier.toLowerCase();

  containerElement.innerHTML = `
    <div class="quote-card border-${tierClass}">
      <div class="quote-header">
        <h3>AI Risk Assessment</h3>
        <span class="badge badge-${tierClass}">${assessment.risk_tier} Risk (${assessment.risk_score}/100)</span>
      </div>

      <p class="quote-explanation">"${assessment.explanation}"</p>

      <div class="quote-metrics">
        <div class="metric">
          <span class="label">Total Premium</span>
          <span class="value highlight">${currencySymbol}${quote.totalPremiumUSD}</span>
        </div>
        <div class="metric">
          <span class="label">Daily Rate</span>
          <span class="value">${currencySymbol}${quote.dailyRateUSD}/day</span>
        </div>
        <div class="metric">
          <span class="label">Est. Deductible</span>
          <span class="value">${currencySymbol}${quote.estimatedDeductibleUSD}</span>
        </div>
      </div>

      <div class="quote-terms">
        <small><strong>Terms Note:</strong> ${assessment.suggested_terms}</small>
      </div>

      <button id="btn-proceed-checkout" class="btn btn-primary full-width">
        Proceed to Purchase Coverage
      </button>
    </div>
  `;
}