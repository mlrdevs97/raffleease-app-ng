import { AssociationRole } from '../../../core/models/user.model';
import { PhoneNumberData } from '../../auth/models/auth.model';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber?: PhoneNumberData;
  password: string;
  confirmPassword: string;
}

export interface CreateUserRequest {
  userData: CreateUserData;
  role: AssociationRole;
}

export interface CreateUserResponse {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber?: PhoneNumberData;
  role: AssociationRole;
  isEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
} 