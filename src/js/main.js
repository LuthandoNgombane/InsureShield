/**
 * main.js
 * Application entry point for InsureShield
 */

import '../styles/main.css';

import { evaluateItemRisk } from './aiRiskService.js';
import { calculatePremium } from './quoteCalculator.js';
import { createPolicy, refreshPolicyStatuses, deletePolicy } from './policyModel.js';
import { validateItemDetails, validateCoverageParams } from './formValidator.js';
import { evaluateClaim } from './aiClaimService.js';
import { convertFromUSD } from './currencyService.js';
import { renderLoading, renderQuoteResult, renderPolicyDashboard } from './uiRenderer.js';
import { loadPartials } from './partialsLoader.js';

let currentQuoteData = null;

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  ZAR: "R"
};

document.addEventListener("DOMContentLoaded", () => {
  loadPartials();
  const quoteForm = document.getElementById("quick-quote-form");
  const quoteResultContainer = document.getElementById("quote-result-container");
  const dashboardContainer = document.getElementById("policies-dashboard");

  // Load dashboard policies if dashboard container exists
  loadDashboard();

  if (quoteForm) {
    quoteForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const selectedCurrency = document.getElementById("currency-select")?.value || "USD";

      const itemData = {
        category: document.getElementById("item-category").value,
        description: document.getElementById("item-description").value,
        value: parseFloat(document.getElementById("item-value").value),
        useCase: document.getElementById("item-usecase").value,
        durationDays: parseInt(document.getElementById("item-duration").value, 10),
        currency: selectedCurrency
      };

      // Form Validations
      const step1Val = validateItemDetails(itemData);
      const step2Val = validateCoverageParams(itemData);

      if (!step1Val.isValid || !step2Val.isValid) {
        alert("Please ensure all fields are filled out correctly.");
        return;
      }

      renderLoading(quoteResultContainer, "Connecting to Gemini AI for risk evaluation...");

      try {
        const aiAssessment = await evaluateItemRisk(itemData);
        const quote = calculatePremium(itemData.value, itemData.durationDays, aiAssessment.risk_score);

        // Fetch selected currency and convert quote metrics
        const currencySelect = document.getElementById("currency-select");
        const selectedCurrency = currencySelect ? currencySelect.value : "USD";
        
        const convertedPremium = await convertFromUSD(quote.totalPremiumUSD, selectedCurrency);
        const convertedDailyRate = await convertFromUSD(quote.dailyRateUSD, selectedCurrency);
        const convertedDeductible = await convertFromUSD(quote.estimatedDeductibleUSD, selectedCurrency);

        const convertedQuote = {
          ...quote,
          totalPremiumUSD: convertedPremium,
          dailyRateUSD: convertedDailyRate,
          estimatedDeductibleUSD: convertedDeductible
        };

        currentQuoteData = { ...itemData, aiAssessment, quote: convertedQuote, currency: selectedCurrency };

        const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] || "$";
        renderQuoteResult(quoteResultContainer, aiAssessment, convertedQuote, currencySymbol);

        // Bind checkout purchase action
        const checkoutBtn = document.getElementById("btn-proceed-checkout");
        if (checkoutBtn) {
          checkoutBtn.addEventListener("click", handlePurchase);
        }
      } catch (error) {
        console.error("Quote Generation Error:", error);
      }
    });
  }

  function handlePurchase() {
    if (!currentQuoteData) return;

    const newPolicy = createPolicy(currentQuoteData);
    alert(`Success! Policy ${newPolicy.id} has been activated.`);
    currentQuoteData = null;
    quoteResultContainer.innerHTML = `<div class="empty-state"><p>Policy purchased! Check policy status below.</p></div>`;
    loadDashboard();
  }

  function loadDashboard() {
    if (!dashboardContainer) return;
    const policies = refreshPolicyStatuses();
    renderPolicyDashboard(dashboardContainer, policies, handleClaimSubmission, handleCancelPolicy);
  }

  async function handleClaimSubmission(policyId) {
    const claimReason = prompt("Describe the claim incident (e.g., Camera dropped during outdoor gig):");
    if (!claimReason) return;

    const amountStr = prompt("Enter claimed amount in USD:");
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    const policies = refreshPolicyStatuses();
    const policy = policies.find((p) => p.id === policyId);

    if (!policy) return;

    alert("Submitting claim to AI Adjuster...");
    const claimResult = await evaluateClaim(policy, claimReason, amount);

    if (claimResult.claim_approved) {
      alert(`Claim Approved! $${claimResult.approved_amount} will be disbursed. Rationale: ${claimResult.decision_reason}`);
    } else {
      alert(`Claim Denied/Flagged. Reason: ${claimResult.decision_reason}`);
    }
  }

  
  function handleCancelPolicy(policyId) {
    const confirmed = confirm(`Are you sure you want to cancel policy ${policyId}?`);
    if (confirmed) {
      deletePolicy(policyId);
      loadDashboard();
    }
  }

});

