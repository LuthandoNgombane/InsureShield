/**
 * policyDashboard.js
 * Entry point for the Policies Dashboard page.
 */

import '../styles/main.css';
import { refreshPolicyStatuses } from './policyModel.js';
import { evaluateClaim } from './aiClaimService.js';
import { renderPolicyDashboard } from './uiRenderer.js';
import { loadPartials } from './partialsLoader.js';

document.addEventListener("DOMContentLoaded", () => {
  loadPartials();
  const dashboardContainer = document.getElementById("policies-dashboard");

  if (!dashboardContainer) return;

  function loadDashboard() {
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
    try {
      const claimResult = await evaluateClaim(policy, claimReason, amount);

      if (claimResult.claim_approved) {
        alert(`Claim Approved! $${claimResult.approved_amount} disbursed. Rationale: ${claimResult.decision_reason}`);
      } else {
        alert(`Claim Denied/Flagged. Reason: ${claimResult.decision_reason}`);
      }
    } catch (error) {
      console.error("Claim Submission Error:", error);
      alert("Failed to submit claim. Please try again.");
    }
  }

  loadDashboard();
});