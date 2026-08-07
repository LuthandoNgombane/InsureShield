/**
 * main.js
 * Entry point for Week 5 application logic.
 */

import { evaluateItemRisk } from './aiRiskService.js';
import { calculatePremium } from './quoteCalculator.js';
import { renderLoading, renderQuoteResult } from './uiRenderer.js';
import { convertFromUSD } from './currencyService.js';

document.addEventListener("DOMContentLoaded", () => {
  const quoteForm = document.getElementById("quick-quote-form");
  const quoteResultContainer = document.getElementById("quote-result-container");

  if (!quoteForm) return;

  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 1. Gather form inputs
    const itemData = {
      category: document.getElementById("item-category").value,
      description: document.getElementById("item-description").value,
      value: parseFloat(document.getElementById("item-value").value),
      useCase: document.getElementById("item-usecase").value,
      durationDays: parseInt(document.getElementById("item-duration").value, 10)
    };

    // 2. Render Loading UI
    renderLoading(quoteResultContainer, "Connecting to Gemini AI for risk evaluation...");

    try {
      // 3. Call AI Service
      const aiAssessment = await evaluateItemRisk(itemData);

      // 4. Calculate Quote
      const quote = calculatePremium(
        itemData.value, 
        itemData.durationDays, 
        aiAssessment.risk_score
      );

      // 5. Render Output
      renderQuoteResult(quoteResultContainer, aiAssessment, quote);

    } catch (error) {
      console.error("Error processing quote:", error);
      quoteResultContainer.innerHTML = `
        <div class="error-card">
          <p>⚠️ Unable to generate AI quote. Please check your inputs and try again.</p>
        </div>
      `;
    }
  });
});