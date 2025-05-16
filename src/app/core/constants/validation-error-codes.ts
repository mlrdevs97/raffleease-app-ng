/**
 * Constants for validation error codes returned by the server API
 */
export const ValidationErrorCodes = {
  // Required field validations
  REQUIRED: 'REQUIRED',
  
  // Format validations
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_DIGITS: 'INVALID_DIGITS',
  INVALID_URL: 'INVALID_URL',
  
  // Size and range
  INVALID_LENGTH: 'INVALID_LENGTH',
  TOO_SMALL: 'TOO_SMALL',
  TOO_LARGE: 'TOO_LARGE',
  
  // Number validations
  MUST_BE_POSITIVE: 'MUST_BE_POSITIVE',
  MUST_BE_POSITIVE_OR_ZERO: 'MUST_BE_POSITIVE_OR_ZERO',
  MUST_BE_NEGATIVE: 'MUST_BE_NEGATIVE',
  MUST_BE_NEGATIVE_OR_ZERO: 'MUST_BE_NEGATIVE_OR_ZERO',
  
  // Date validations
  MUST_BE_IN_PAST: 'MUST_BE_IN_PAST',
  MUST_BE_IN_PAST_OR_PRESENT: 'MUST_BE_IN_PAST_OR_PRESENT',
  MUST_BE_IN_FUTURE: 'MUST_BE_IN_FUTURE',
  MUST_BE_IN_FUTURE_OR_PRESENT: 'MUST_BE_IN_FUTURE_OR_PRESENT',
  
  // Assertive checks
  MUST_BE_TRUE: 'MUST_BE_TRUE',
  MUST_BE_FALSE: 'MUST_BE_FALSE',
  
  // Type conversion
  INVALID_TYPE: 'INVALID_TYPE',
  
  // Unique constraint
  VALUE_ALREADY_EXISTS: 'VALUE_ALREADY_EXISTS',
  
  // Fallback
  INVALID_FIELD: 'INVALID_FIELD',
  INVALID_NESTED_FIELD: 'INVALID_NESTED_FIELD'
} as const;

export type ValidationErrorCode = keyof typeof ValidationErrorCodes;

/**
 * Maps validation error codes to user-friendly messages
 */
export const ValidationErrorMessages: Record<ValidationErrorCode, string> = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_FORMAT: 'The format is invalid',
  INVALID_DIGITS: 'Please enter only digits',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_LENGTH: 'The length is invalid',
  TOO_SMALL: 'The value is too small',
  TOO_LARGE: 'The value is too large',
  MUST_BE_POSITIVE: 'Please enter a positive number',
  MUST_BE_POSITIVE_OR_ZERO: 'Please enter a positive number or zero',
  MUST_BE_NEGATIVE: 'Please enter a negative number',
  MUST_BE_NEGATIVE_OR_ZERO: 'Please enter a negative number or zero',
  MUST_BE_IN_PAST: 'The date must be in the past',
  MUST_BE_IN_PAST_OR_PRESENT: 'The date must be in the past or present',
  MUST_BE_IN_FUTURE: 'The date must be in the future',
  MUST_BE_IN_FUTURE_OR_PRESENT: 'The date must be in the future or present',
  MUST_BE_TRUE: 'This field must be true',
  MUST_BE_FALSE: 'This field must be false',
  INVALID_TYPE: 'The type is invalid',
  VALUE_ALREADY_EXISTS: 'This value already exists',
  INVALID_FIELD: 'This field is invalid',
  INVALID_NESTED_FIELD: 'This field contains invalid values'
}; 