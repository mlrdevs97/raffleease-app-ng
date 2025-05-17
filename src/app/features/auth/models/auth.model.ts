export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  associationId?: number;
}

export interface LoginRequest {
  identifier: string;
  password: string;
  rememberMe?: boolean;
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
}

export interface RegisterResponse {
  id: string;
  email: string;
} 