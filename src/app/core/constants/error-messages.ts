import { ErrorCode, ValidationErrorCode } from "./error-codes";

export const ErrorMessages: {
    status: Partial<Record<number, string>>;
    general: Partial<Record<ErrorCode, string>>;
    validation: Partial<Record<ValidationErrorCode, string>>;
    dedicated: Record<string, Partial<Record<string, string>>>;
} = {
    status: {
        500: 'Something went wrong on our end. Please try again later.',
        502: 'The server is down or being restarted. Please wait a moment.',
        503: 'The service is temporarily unavailable. Please try again shortly.'
    },
    general: {
        UNAUTHORIZED: 'Authentication failed. Please log in again.',
        ACCESS_DENIED: 'You do not have permission to perform this action.',
        USER_NOT_FOUND: 'User not found.',
        EMAIL_VERIFICATION_FAILED: 'Email verification failed. The token may be invalid or expired.',
        NOT_FOUND: 'The requested resource was not found.',
        CONFLICT: 'A conflict occurred. The operation could not be completed.',
        BUSINESS_ERROR: 'The operation could not be completed due to a business rule violation.'
    },
    validation: {
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
    },
    dedicated: {
        'userData.email': {
            UNIQUE: 'This email is already registered',
            REQUIRED: 'Email is required'
        },
        'userData.userName': {
            UNIQUE: 'This username is already taken',
            REQUIRED: 'Username is required'
        },
        'userData.phoneNumber': {
            UNIQUE: 'This phone number is already registered',
            REQUIRED: 'Phone number is required'
        },
        'associationData.associationName': {
            UNIQUE: 'This association name is already taken',
            REQUIRED: 'Association name is required'
        },
        'associationData.email': {
            UNIQUE: 'This email is already registered for another association',
            REQUIRED: 'Email is required'
        },
        'associationData.phoneNumber': {
            UNIQUE: 'This phone number is already registered for another association',
            REQUIRED: 'Phone number is required'
        },
        'files': {
            REQUIRED: 'You must upload at least one image'
        },
        'raffle': {
            CANNOT_DELETE: 'Only raffles with PENDING status can be deleted',
            NOT_FOUND: 'The selected raffle was not found. Please try selecting a different raffle.',
            INACTIVE: 'This raffle is not currently active and tickets cannot be selected.',
            INSUFFICIENT_TICKETS: 'Not enough tickets are available for this request.',
            SELECTION_REQUIRED: 'Please select a raffle first to generate random tickets',
            NOT_AVAILABLE_FOR_ORDERS: 'Only active raffles allow creating new orders.'
        },
        'tickets': {
            NOT_FOUND: 'The requested ticket was not found or is no longer available.',
            ALREADY_SELECTED: 'This ticket has already been selected.',
            NOT_AVAILABLE: 'This ticket is not available for selection.',
            SEARCH_FAILED: 'Failed to search for tickets. Please try again.',
            GENERATION_FAILED: 'Failed to generate random tickets. Please try again.',
            INSUFFICIENT_QUANTITY: 'Not enough tickets are available to fulfill your request.',
            INVALID_QUANTITY: 'Please enter a valid number of tickets (minimum 1)',
            ADDITION_FAILED: 'Failed to add ticket to your selection. Please try again.',
            RAFFLE_NOT_FOUND: 'Raffle not found. Please select a valid raffle.',
            ACCESS_DENIED: 'You do not have permission to search tickets for this raffle.',
            SERVER_ERROR: 'Server error occurred while searching for tickets. Please try again.',
            CONNECTION_ERROR: 'Connection error. Please check your internet connection.',
            SEARCH_ERROR: 'Failed to search for tickets. Please try again.'
        },
        'order': {
            CREATION_FAILED: 'Failed to create order. Please try again.',
            CART_NOT_FOUND: 'No active cart found. Please refresh and try again.',
            CART_EXPIRED: 'Your cart has expired. Please start a new order.',
            INVALID_CART: 'Invalid cart. Please refresh and try again.',
            NO_TICKETS_SELECTED: 'Please select at least one ticket before creating an order.',
            NOT_FOUND: 'The selected order was not found. Please try selecting a different order.'
        },
        'customer': {
            PHONE_INVALID: 'Please enter a valid phone number',
            EMAIL_ALREADY_EXISTS: 'A customer with this email already exists',
            PHONE_ALREADY_EXISTS: 'A customer with this phone number already exists'
        },
        'customerInformation.phoneNumber.countryCode': {
            PATTERN: 'Country code must start with + followed by 1-3 digits',
            REQUIRED: 'Country code is required'
        },
        'customerInformation.phoneNumber.nationalNumber': {
            PATTERN: 'Phone number must contain only digits (1-14 digits)',
            REQUIRED: 'Phone number is required'
        },
        'customerInformation.fullName': {
            REQUIRED: 'Full name is required',
            MAXLENGTH: 'Full name must be less than 100 characters'
        },
        'customerInformation.email': {
            REQUIRED: 'Email is required',
            INVALID_EMAIL: 'Please enter a valid email address',
            MAXLENGTH: 'Email must be less than 100 characters'
        }
    }
};
