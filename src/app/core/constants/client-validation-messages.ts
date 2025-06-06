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
   * Authentication validation error messages
   */
  auth: {
    sessionExpired: 'Your session has expired. Please log in again.',
    authenticationRequired: 'Authentication required. Please log in again.',
    invalidSession: 'Invalid session. Please log in again.',
    invalidServerResponse: 'Invalid server response. Please try again.'
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
  },

  /**
   * Ticket validation error messages
   */
  ticket: {
    raffleRequired: 'Please select a raffle first to search for tickets',
    notFound: 'Ticket not found',
    notAvailable: 'This ticket is not available for selection'
  },

  /**
   * Phone number validation error messages
   */
  phone: {
    countryCodePattern: 'Country code must start with + followed by 1-3 digits',
    nationalNumberPattern: 'Phone number must contain only digits (1-14 digits)',
    countryCodeRequired: 'Country code is required',
    nationalNumberRequired: 'Phone number is required'
  },

  /**
   * Payment method validation error messages
   */
  paymentMethod: {
    required: 'Please select a payment method to continue'
  },

  /**
   * Raffle validation error messages
   */
  raffle: {
    selectionRequired: 'Please select a raffle to continue',
    notAvailableForOrders: 'Only active raffles allow creating orders.',
    statusPending: 'Cannot create orders for pending raffles.',
    statusPaused: 'Cannot create orders for paused raffles.',
    statusCompleted: 'Cannot create orders for completed raffles.'
  }
}; 