/**
 * policyDashboard.js
 * Entry point for the Policies Dashboard page.
 */

import '../styles/main.css';
import { refreshPolicyStatuses, deletePolicy } from './policyModel.js';
import { evaluateClaim } from './aiClaimService.js';
import { renderPolicyDashboard } from './uiRenderer.js';
import { loadPartials } from './partialsLoader.js';

document.addEventListener("DOMContentLoaded", () => {
  loadPartials();
  const dashboardContainer = document.getElementById("policies-dashboard");

  if (!dashboardContainer) return;

  function loadDashboard() {
    const policies = refreshPolicyStatuses();
    // Passed handleCancelPolicy as 4th argument
    renderPolicyDashboard(dashboardContainer, policies, handleClaimSubmission, handleCancelPolicy);
  }

  function handleCancelPolicy(policyId) {
    const confirmed = confirm(`Are you sure you want to cancel policy ${policyId}? This action will permanently delete the coverage from local storage.`);
    if (confirmed) {
      deletePolicy(policyId);
      loadDashboard();
    }
  }

  async function handleClaimSubmission(policyId) {
    const policies = refreshPolicyStatuses(); 
    const policy = policies.find((p) => p.id === policyId); 

    if (!policy) return; 

    const currencyCode = policy.currency || "USD";
    const claimReason = prompt("Describe the claim incident (e.g., Camera dropped during outdoor gig):"); 
    if (!claimReason) return; 

    const amountStr = prompt(`Enter claimed amount in ${currencyCode}:`);
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return; 

    alert("Submitting claim to AI Adjuster..."); 
    try {
      const claimResult = await evaluateClaim(policy, claimReason, amount, currencyCode); 

      if (claimResult.claim_approved) {
        alert(`Claim Approved! ${currencyCode} ${claimResult.approved_amount} disbursed. Rationale: ${claimResult.decision_reason}`);
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