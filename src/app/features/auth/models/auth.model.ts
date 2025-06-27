export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  associationId?: number;
  userId?: number;
  token: string | null;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface PhoneNumberData {
  prefix: string;
  nationalNumber: string;
}

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber?: PhoneNumberData;
  password: string;
  confirmPassword: string;
}

export interface RegisterAddressData {
  placeId: string;
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  zipCode: string;
  formattedAddress: string;
}

export interface RegisterAssociationData {
  associationName: string;
  description: string;
  email: string;
  phoneNumber?: PhoneNumberData;
  addressData: RegisterAddressData;
}

export interface RegisterRequest {
  userData: RegisterUserData;
  associationData: RegisterAssociationData;
}

export interface RegisterEmailVerificationRequest {
  verificationToken: string;
}

export interface AuthResponse {
  accessToken: string;
  associationId: number;
  userId: number;
}

export interface RegisterResponse {
  id: string;
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
} 