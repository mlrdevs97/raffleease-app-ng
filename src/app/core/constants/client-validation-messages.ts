/**
 * Client-side validation error messages used across the application
 */
export const ClientValidationMessages = {
  /**
   * Common validation error messages
   */
  common: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: (min: number) => `This field must be at least ${min} characters`,
    maxlength: (max: number) => `This field must be less than ${max} characters`,
    pattern: 'The format is invalid',
    min: (min: number) => `This field must be at least ${min}`,
    max: (max: number) => `This field must be less than ${max}`,
    serverError: 'Server error occurred'
  },
  
  /**
   * Number validation error messages
   */
  number: {
    positive: 'Please enter a positive number',
    nonNegative: 'Please enter a non-negative value',
    minGreaterThanMax: 'Minimum value cannot be greater than maximum value'
  },
  
  /**
   * Date validation error messages
   */
  date: {
    dateRange: 'From date cannot be after To date',
    future: 'Date must be in the future',
    past: 'Date must be in the past'
  },
  
  /**
   * User input validation error messages
   */
  customer: {
    nameMaxLength: 'Name must be less than 100 characters',
    emailMaxLength: 'Email must be less than 100 characters',
    emailInvalid: 'Please enter a valid email address',
    phoneMaxLength: 'Phone number must be less than 30 characters'
  },

  /**
   * Password validation error messages
   */
  password: {
    mismatch: 'Passwords do not match',
    complexity: 'Password must be 8-32 characters and include: uppercase, lowercase, number, and special character',
    pattern: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  },

  /**
   * Search validation error messages
   */
  search: {
    noCriteria: 'Please enter at least one search criteria',
    searchFailed: 'Failed to search orders. Please try again.',
    unknownError: 'Unknown error occurred'
  }
}; 