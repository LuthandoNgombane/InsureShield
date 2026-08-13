/**
 * uiRenderer.js
 * Handles UI rendering, status cards, policy lists, countdown timers, and claim dialogs.
 */

import { fetchExchangeRates } from './currencyService.js';

let timerIntervals = {};

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  ZAR: "R"
};

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
 * @param {Function} onCancelClick  
 */
export async function renderPolicyDashboard(container, policies, onClaimClick, onCancelClick) {
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

  // Fetch exchange rates to perform USD conversions for display
  const rates = await fetchExchangeRates(); 

  container.innerHTML = policies
    .map((policy) => {
      const code = policy.currency || "USD";
      const symbol = CURRENCY_SYMBOLS[code] || "$";
      const rate = rates[code] || 1;

      // Convert values to USD if non-USD currency
      const valUSD = code !== "USD" ? ` (USD $${(policy.value / rate).toFixed(2)})` : "";
      const premiumUSD = code !== "USD" ? ` (USD $${(policy.quote.totalPremiumUSD / rate).toFixed(2)})` : "";

      return `
        <div class="card policy-card status-${policy.status.toLowerCase()}" id="policy-${policy.id}">
          <div class="policy-header">
            <span class="policy-id">${policy.id}</span>
            <span class="badge status-badge-${policy.status.toLowerCase()}">${policy.status}</span>
          </div>
          <h4>${policy.category} - ${policy.description}</h4>
          <div class="policy-details">
            <p><strong>Value Covered:</strong> ${symbol}${policy.value}${valUSD}</p>
            <p><strong>Premium Paid:</strong> ${symbol}${policy.quote.totalPremiumUSD}${premiumUSD}</p>
          </div>
          
          ${
            policy.status === "Active"
              ? `<div class="timer-box">
                  <small>Coverage Remaining:</small>
                  <div class="countdown-timer" id="timer-${policy.id}">Calculating...</div>
                 </div>`
              : ""
          }

          <div class="policy-actions" style="display: flex; gap: 10px; margin-top: 10px;">
            ${
              policy.status === "Active"
                ? `<button class="btn btn-secondary btn-claim" data-policy-id="${policy.id}">Submit Claim</button>
                   <button class="btn btn-danger btn-cancel" data-policy-id="${policy.id}" style="background-color: #dc3545; color: white;">Cancel Policy</button>`
                : `<button class="btn btn-disabled" disabled>Policy Ended</button>`
            }
            <button class="btn btn-export" data-policy-id="${policy.id}" style="background-color: #0d6efd; color: white;">📄 Export Receipt</button>
          </div>
        </div>
      `;
    })
    .join("");

  // Attach event listeners for claims
  container.querySelectorAll(".btn-claim").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const pId = e.target.getAttribute("data-policy-id");
      onClaimClick(pId);
    });
  });

  // Attach event listeners for cancellation
  container.querySelectorAll(".btn-cancel").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const pId = e.target.getAttribute("data-policy-id");
      if (typeof onCancelClick === "function") {
        onCancelClick(pId);
      }
    });
  });

  // Attach event listeners for exporting policy documents
  container.querySelectorAll(".btn-export").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const pId = e.target.getAttribute("data-policy-id");
      const policy = policies.find((p) => p.id === pId);
      if (policy) {
        exportPolicyDocument(policy);
      }
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
 * Downloads policy document receipt as a structured JSON file (Week 7).
 */
export function exportPolicyDocument(policy) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(policy, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `InsureShield_Policy_${policy.id}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
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