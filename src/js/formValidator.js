/**
 * formValidator.js
 * Provides validation routines for forms and step-by-step registration wizard fields.
 */

/**
 * Validates step 1 (Basic Item Details)
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateItemDetails(data) {
  const errors = {};

  if (!data.category || data.category.trim() === "") {
    errors.category = "Please select an item category.";
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters long.";
  }

  if (!data.value || isNaN(data.value) || Number(data.value) < 10) {
    errors.value = "Declared value must be at least $10.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates step 2 (Coverage Parameters)
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateCoverageParams(data) {
  const errors = {};

  if (!data.useCase) {
    errors.useCase = "Please select a usage scenario.";
  }

  if (!data.durationDays || isNaN(data.durationDays) || data.durationDays < 1 || data.durationDays > 365) {
    errors.durationDays = "Duration must be between 1 and 365 days.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates policy holder info during checkout
 * @param {Object} data 
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateHolderInfo(data) {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = "Please enter full legal name.";
  }

  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}