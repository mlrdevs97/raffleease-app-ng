import { PhoneNumberData } from "../../features/auth/models/auth.model";

export enum AssociationRole {
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    COLLABORATOR = 'COLLABORATOR'
  }
  
  export interface User {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber: PhoneNumberData;
    role: AssociationRole;
    isEnabled: boolean;
    createdAt: string;
    updatedAt?: string;
  }
  