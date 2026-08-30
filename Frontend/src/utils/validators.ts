/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate employee ID format
 */
export const isValidEmployeeId = (id: string): boolean => {
  // Example format: MET-2024-001
  const idRegex = /^[A-Z]{2,4}-\d{4}-\d{3}$/;
  return idRegex.test(id);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  // Minimum 6 characters for Phase 1
  return password.length >= 6;
};

/**
 * Check if a string is empty or only whitespace
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * Validate date is not in the future
 */
export const isNotFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
};

/**
 * Validate date is not in the past
 */
export const isNotPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date >= today;
};

/**
 * Get validation error message for a field
 */
export const getFieldError = (
  fieldName: string,
  value: string,
  rules: {
    required?: boolean;
    email?: boolean;
    phone?: boolean;
    minLength?: number;
    maxLength?: number;
  }
): string | null => {
  if (rules.required && isEmpty(value)) {
    return `${fieldName} is required`;
  }

  if (rules.email && value && !isValidEmail(value)) {
    return `Please enter a valid email address`;
  }

  if (rules.phone && value && !isValidPhone(value)) {
    return `Please enter a valid phone number`;
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `${fieldName} must be no more than ${rules.maxLength} characters`;
  }

  return null;
};