# 🛡️ InsureShield — AI-Powered Micro-Insurance Platform

**InsureShield** is a dynamic web application designed to deliver real-time, micro-insurance underwriting, instant risk assessment, and automated claim evaluations powered by Artificial Intelligence. Built using modern JavaScript (ES6+), Vite, and RESTful APIs, InsureShield enables users to protect high-value personal equipment and gear on short-term, flexible coverage plans.

---

## 🚀 Key Features

* **🤖 AI Underwriting & Risk Evaluation:** Integrates with the **Google Gemini API** to analyze item parameters (category, condition, value, and usage scenario) and generate structured risk scores (1–100), risk tiers, custom deductibles, and tailored policy terms.
* **💱 Live Multi-Currency Support:** Connects to the **Open Exchange Rates API** to fetch live currency conversion rates (USD, ZAR, EUR, GBP). Displays localized premiums and item valuations side-by-side with USD equivalents.
* **📋 Dynamic Active Policy Dashboard:** Provides a centralized view of all user policies stored in `localStorage`. Features real-time live countdown timers tracking policy expiration down to the second.
* **⚖️ Automated AI Claims Adjuster:** Allows policyholders to submit claim incidents directly through the platform. The Gemini AI Claims Adjuster evaluates policy compliance, incident descriptions, and fraud risk flags to return instant disbursement decisions.
* **🗑️ Policy Lifecycle Management:** Complete client-side state management allowing users to purchase policies, monitor active countdowns, file claims, or cancel active coverages.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** Vanilla JavaScript (ES6+ Modules), HTML5, Modern CSS3
* **Build Tool & Bundler:** Vite
* **AI Engine:** Google Gemini REST API (with structured JSON responses)
* **Financial API:** Open ER-API (Live USD Exchange Rates)
* **Persistence:** Client-side `localStorage` state engine

---

## ⚙️ Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* A Google Gemini API Key

🎓 Course Context
Developed as the final portfolio capstone project for WDD 330 (Web Frontend Development II) at BYU-Idaho.

### Installation

1. **Clone the repository:**
2. **npm install**
3. UPDATE YOUR GEMINI KEY
4. **npm run dev**
