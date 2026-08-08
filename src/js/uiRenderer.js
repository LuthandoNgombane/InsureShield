/**
 * uiRenderer.js
 * Handles UI rendering, status cards, policy lists, countdown timers, and claim dialogs.
 */

let timerIntervals = {};

export function renderLoading(containerElement, message = "Analyzing with AI...") {
  containerElement.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

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

      <button id="btn-proceed-checkout" class="btn btn-primary full-width" style="margin-top: 15px;">
        Purchase Policy Coverage
      </button>
    </div>
  `;
}

/**
 * Renders all saved user policies in the dashboard view.
 * @param {HTMLElement} container 
 * @param {Array<Object>} policies 
 * @param {Function} onClaimClick 
 */
export function renderPolicyDashboard(container, policies, onClaimClick) {
  // Clear any existing active countdown intervals
  Object.values(timerIntervals).forEach(clearInterval);
  timerIntervals = {};

  if (!policies || policies.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No active policies found. Generate a quote to protect your valuables.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = policies
    .map(
      (policy) => `
      <div class="card policy-card status-${policy.status.toLowerCase()}" id="policy-${policy.id}">
        <div class="policy-header">
          <span class="policy-id">${policy.id}</span>
          <span class="badge status-badge-${policy.status.toLowerCase()}">${policy.status}</span>
        </div>
        <h4>${policy.category} - ${policy.description}</h4>
        <div class="policy-details">
          <p><strong>Value Covered:</strong> $${policy.value}</p>
          <p><strong>Premium Paid:</strong> $${policy.quote.totalPremiumUSD}</p>
        </div>
        
        ${
          policy.status === "Active"
            ? `<div class="timer-box">
                <small>Coverage Remaining:</small>
                <div class="countdown-timer" id="timer-${policy.id}">Calculating...</div>
               </div>`
            : ""
        }

        <div class="policy-actions">
          ${
            policy.status === "Active"
              ? `<button class="btn btn-secondary btn-claim" data-policy-id="${policy.id}">Submit Claim</button>`
              : `<button class="btn btn-disabled" disabled>Policy Ended</button>`
          }
        </div>
      </div>
    `
    )
    .join("");

  // Attach event listeners for claims
  container.querySelectorAll(".btn-claim").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const pId = e.target.getAttribute("data-policy-id");
      onClaimClick(pId);
    });
  });

  // Start active timers
  policies.forEach((policy) => {
    if (policy.status === "Active") {
      startCountdownTimer(policy.id, policy.endDate);
    }
  });
}

/**
 * Sets up a live tick countdown timer for an active policy.
 */
function startCountdownTimer(policyId, endDateIso) {
  const targetTime = new Date(endDateIso).getTime();

  const updateTimer = () => {
    const element = document.getElementById(`timer-${policyId}`);
    if (!element) return;

    const now = new Date().getTime();
    const diff = targetTime - now;

    if (diff <= 0) {
      element.innerHTML = "<strong class='text-danger'>Expired</strong>";
      clearInterval(timerIntervals[policyId]);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    element.innerHTML = `<strong>${hours}h ${minutes}m ${seconds}s</strong>`;
  };

  updateTimer();
  timerIntervals[policyId] = setInterval(updateTimer, 1000);
}