import { PhoneNumberData } from '../../auth/models/auth.model';

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  userName: string;
}

export interface UpdateEmailRequest {
  newEmail: string;
}

export interface UpdatePhoneNumberRequest {
  phoneNumber: PhoneNumberData;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailUpdateRequest {
  token: string;
}

export interface UserProfileFormData {
  firstName: string;
  lastName: string;
  userName: string;
}

export interface EmailFormData {
  newEmail: string;
}

export interface PhoneNumberFormData {
  phoneNumber: {
    prefix: string;
    nationalNumber: string;
  };
}

export interface PasswordFormData {
  currentPassword: string;
  password: string;
  confirmPassword: string;
} 