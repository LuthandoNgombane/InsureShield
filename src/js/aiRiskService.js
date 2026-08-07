/**
 * aiRiskService.js
 * Handles communication with the Google Gemini REST API to evaluate item risk.
 */

// Access the API key defined in your .env file via Vite environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

/**
 * Evaluates the risk score and details for an insurance item request.
 * 
 * @param {Object} itemData - The user-provided item details.
 * @param {string} itemData.category - Category (e.g., Camera, Laptop, Musical Instrument).
 * @param {string} itemData.description - Detailed description and condition of the item.
 * @param {number} itemData.value - Declared cash value in USD.
 * @param {string} itemData.useCase - Intended usage scenario (e.g., local studio, outdoor gig, travel).
 * @returns {Promise<Object>} The structured JSON assessment object.
 */
export async function evaluateItemRisk(itemData) {
  if (!API_KEY) {
    throw new Error("Missing Gemini API Key. Please verify your .env file.");
  }

  // System instruction / prompt forcing strict JSON output
  const prompt = `
    You are an expert micro-insurance underwriting system. 
    Analyze the following item details and scenario for micro-insurance coverage:
    
    - Category: ${itemData.category}
    - Description: ${itemData.description}
    - Declared Value: $${itemData.value} USD
    - Usage Scenario: ${itemData.useCase}

    Evaluate the risks (theft, physical damage, portability hazard) and return your assessment strictly as a raw JSON object with no markdown formatting or extra commentary. 

    The JSON response MUST match this exact schema:
    {
      "risk_score": <number between 1 and 100>,
      "risk_tier": "<'Low' | 'Medium' | 'High'>",
      "explanation": "<short 2-sentence rationale for the risk score>",
      "recommended_deductible": <number, suggested deductible in USD>,
      "fraud_risk_flag": <boolean>,
      "suggested_terms": "<short advice on coverage conditions>"
    }
  `;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        // Setting responseMimeType forces Gemini to output valid JSON
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2 // Lower temperature for consistent, structured outputs
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the raw text response from the API payload
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Empty response received from Gemini API.");
    }

    // Parse the JSON string into a JavaScript object
    const structuredAssessment = JSON.parse(rawText);
    return structuredAssessment;

  } catch (error) {
    console.error("Failed to generate AI Risk Assessment:", error);
    
    // Fallback object in case of network issues or rate limits
    return {
      risk_score: 50,
      risk_tier: "Medium",
      explanation: "Fallback assessment generated due to temporary connection difficulties.",
      recommended_deductible: Math.round(itemData.value * 0.1),
      fraud_risk_flag: false,
      suggested_terms: "Standard policy terms apply."
    };
  }
}