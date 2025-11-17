/**
 * Validation utilities for Kenyan-specific formats
 */

/**
 * Validate Kenyan phone number
 * Accepts: +2547xxxxxxxx or 07xxxxxxxx
 */
export const isValidKenyanPhone = (phone: string): boolean => {
  if (!phone) return false;

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  // Check for valid Kenyan phone patterns
  const kenyanPhoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
  
  return kenyanPhoneRegex.test(cleaned);
};

/**
 * Format phone number to standard Kenyan format (+2547xxxxxxxx)
 */
export const formatKenyanPhone = (phone: string): string => {
  if (!phone) return '';

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  // Already in correct format
  if (cleaned.startsWith('+254')) {
    return cleaned;
  }

  // Starts with 254
  if (cleaned.startsWith('254')) {
    return '+' + cleaned;
  }

  // Starts with 0
  if (cleaned.startsWith('0')) {
    return '+254' + cleaned.substring(1);
  }

  // Starts with 7 or 1
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '+254' + cleaned;
  }

  return phone; // Return as-is if format not recognized
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

