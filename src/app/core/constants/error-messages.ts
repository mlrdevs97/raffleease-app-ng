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
        CONFLICT: 'A conflict occurred. The operation could not be completed.'
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
        }
    }
};
