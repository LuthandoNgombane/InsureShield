/**
 * main.js
 * Application entry point for InsureShield (Week 6)
 */

import '../styles/main.css';

import { evaluateItemRisk } from './aiRiskService.js';
import { calculatePremium } from './quoteCalculator.js';
import { createPolicy, refreshPolicyStatuses } from './policyModel.js';
import { validateItemDetails, validateCoverageParams } from './formValidator.js';
import { evaluateClaim } from './aiClaimService.js';
import { renderLoading, renderQuoteResult, renderPolicyDashboard } from './uiRenderer.js';

let currentQuoteData = null;

document.addEventListener("DOMContentLoaded", () => {
  const quoteForm = document.getElementById("quick-quote-form");
  const quoteResultContainer = document.getElementById("quote-result-container");
  const dashboardContainer = document.getElementById("policies-dashboard");

  // Load dashboard policies if dashboard container exists
  loadDashboard();

  if (quoteForm) {
    quoteForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const itemData = {
        category: document.getElementById("item-category").value,
        description: document.getElementById("item-description").value,
        value: parseFloat(document.getElementById("item-value").value),
        useCase: document.getElementById("item-usecase").value,
        durationDays: parseInt(document.getElementById("item-duration").value, 10)
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

        currentQuoteData = { ...itemData, aiAssessment, quote };

        renderQuoteResult(quoteResultContainer, aiAssessment, quote);

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
    renderPolicyDashboard(dashboardContainer, policies, handleClaimSubmission);
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
});