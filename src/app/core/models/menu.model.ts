import { AssociationRole } from './user.model';

export interface MenuItem {
  href: string;
  label: string;
  icon: string;
  exactMatch?: boolean;
  requiredRole?: AssociationRole;
} 