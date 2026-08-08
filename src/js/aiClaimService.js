/**
 * aiClaimService.js
 * Handles AI claim evaluation requests with Gemini REST API.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$){API_KEY}`;

/**
 * Evaluates an insurance claim submission.
 * @param {Object} policy - Policy object.
 * @param {string} claimIncident - Description of what happened.
 * @param {number} claimedAmount - Amount requested.
 * @returns {Promise<Object>}
 */
export async function evaluateClaim(policy, claimIncident, claimedAmount) {
  if (!API_KEY) {
    throw new Error("Missing Gemini API Key. Check .env file.");
  }

  const prompt = `
    You are an AI Claims Adjuster evaluating a micro-insurance claim.
    
    Policy Context:
    - Item: ${policy.category} - ${policy.description}
    - Declared Value: $${policy.value}
    - Allowed Usage Scenario: ${policy.useCase}
    
    Claim Incident:
    - User Incident Description: "${claimIncident}"
    - Amount Claimed: $${claimedAmount} USD

    Evaluate validity, policy compliance, and likelihood of fraud. Return strictly raw JSON.

    JSON Schema:
    {
      "claim_approved": <boolean>,
      "approved_amount": <number>,
      "decision_reason": "<2-sentence explanation>",
      "risk_flag": <boolean>
    }
  `;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      throw new Error("Gemini Claim Evaluation failed.");
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText);
  } catch (error) {
    console.error("AI Claim Service Error:", error);
    return {
      claim_approved: false,
      approved_amount: 0,
      decision_reason: "Claim flagged for manual review due to automated system processing failure.",
      risk_flag: true
    };
  }
}