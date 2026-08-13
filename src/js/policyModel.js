/**
 * policyModel.js
 * Manages saving, retrieving, updating, and expiring micro-insurance policies in localStorage.
 */

const STORAGE_KEY = "insureshield_policies";

/**
 * Retrieves all stored policies from localStorage.
 * @returns {Array<Object>} List of policies.
 */
export function getAllPolicies() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    return rawData ? JSON.parse(rawData) : [];
  } catch (error) {
    console.error("Failed to read policies from localStorage:", error);
    return [];
  }
}

/**
 * Retrieves a single policy by ID.
 * @param {string} policyId 
 * @returns {Object|null}
 */
export function getPolicyById(policyId) {
  const policies = getAllPolicies();
  return policies.find((p) => p.id === policyId) || null;
}

/**
 * Creates and persists a new policy record.
 * @param {Object} policyData - Form details + quote + risk assessment
 * @returns {Object} The saved policy object.
 */
export function createPolicy(policyData) {
  const policies = getAllPolicies();

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + policyData.durationDays * 24 * 60 * 60 * 1000);

  const newPolicy = {
    id: `POL-${Date.now().toString(36).toUpperCase()}`,
    createdAt: startDate.toISOString(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: "Active", // "Active", "Expired", "Claimed"
    claims: [],
    ...policyData
  };

  policies.push(newPolicy);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
  return newPolicy;
}

/**
 * Updates a policy status or adds claims.
 * @param {string} policyId 
 * @param {Object} updates 
 * @returns {Object|null} Updated policy
 */
export function updatePolicy(policyId, updates) {
  const policies = getAllPolicies();
  const index = policies.findIndex((p) => p.id === policyId);

  if (index === -1) return null;

  policies[index] = { ...policies[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
  return policies[index];
}

/**
 * Sweeps policies and updates status to "Expired" if endDate has passed.
 * @returns {Array<Object>} Fresh array of policies
 */
export function refreshPolicyStatuses() {
  const policies = getAllPolicies();
  const now = new Date().getTime();
  let updated = false;

  const refreshed = policies.map((policy) => {
    if (policy.status === "Active" && new Date(policy.endDate).getTime() <= now) {
      updated = true;
      return { ...policy, status: "Expired" };
    }
    return policy;
  });

  if (updated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed));
  }

  return refreshed;
}

/**
 * Deletes a policy from localStorage by ID.
 * @param {string} policyId 
 * @returns {boolean} Success status
 */
export function deletePolicy(policyId) {
  const policies = getAllPolicies();
  const filtered = policies.filter((p) => p.id !== policyId);
  
  if (filtered.length !== policies.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
  return false;
}


