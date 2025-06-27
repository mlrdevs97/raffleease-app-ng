import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownSelectComponent } from '../../../../shared/components/dropdown-select/dropdown-select.component';
import { AssociationRole } from '../../../../core/models/user.model';
import { UserSearchFilters } from '../../services/manage-accounts.services';
import { Subscription } from 'rxjs';

interface RoleOption {
  value: AssociationRole;
  label: string;
}

@Component({
  selector: 'app-users-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownSelectComponent],
  templateUrl: './users-search-form.component.html',
})
export class UsersSearchFormComponent implements OnInit, OnDestroy {
  @Input() criteria: UserSearchFilters = {};
  @Input() fieldErrors: Record<string, string> = {};
  @Input() resetEvent?: EventEmitter<void>;
  @Output() searchSubmit = new EventEmitter<UserSearchFilters>();

  // Form fields
  fullName = signal('');
  email = signal('');
  phoneNumber = signal('');
  selectedRole = signal<AssociationRole | null>(null);

  private resetSubscription?: Subscription;

  readonly roleOptions: RoleOption[] = [
    { value: AssociationRole.ADMIN, label: 'Admin' },
    { value: AssociationRole.MEMBER, label: 'Member' },
    { value: AssociationRole.COLLABORATOR, label: 'Collaborator' }
  ];

  // Get role option labels for dropdown
  get roleOptionLabels(): string[] {
    return this.roleOptions.map(option => option.label);
  }

  ngOnInit(): void {
    if (this.criteria) {
      this.fullName.set(this.criteria.fullName || '');
      this.email.set(this.criteria.email || '');
      this.phoneNumber.set(this.criteria.phoneNumber || '');
      this.selectedRole.set((this.criteria.role as AssociationRole) || null);
    }

    if (this.resetEvent) {
      this.resetSubscription = this.resetEvent.subscribe(() => {
        this.clearForm();
      });
    }
  }

  ngOnDestroy(): void {
    this.resetSubscription?.unsubscribe();
  }

  onSubmit(): void {
    const currentCriteria: UserSearchFilters = {
      fullName: this.fullName().trim() || undefined,
      email: this.email().trim() || undefined,
      phoneNumber: this.phoneNumber().trim() || undefined,
      role: this.selectedRole() || undefined
    };

    const cleanCriteria: UserSearchFilters = {};
    Object.entries(currentCriteria).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanCriteria[key as keyof UserSearchFilters] = value;
      }
    });

    this.searchSubmit.emit(cleanCriteria);
  }

  onFullNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.fullName.set(target.value);
  }

  onEmailChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
  }

  onPhoneNumberChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.phoneNumber.set(target.value);
  }

  onRoleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedRole.set(value === '' ? null : value as AssociationRole);
  }

  onRoleDropdownChange(selectedLabel: string): void {
    if (selectedLabel === 'ANY' || selectedLabel === '') {
      this.selectedRole.set(null);
      return;
    }

    const selectedOption = this.roleOptions.find(option => option.label === selectedLabel);
    this.selectedRole.set(selectedOption ? selectedOption.value : null);
  }

  getSelectedRoleLabel(): string {
    const currentRole = this.selectedRole();
    if (!currentRole) return '';
    
    const roleOption = this.roleOptions.find(option => option.value === currentRole);
    return roleOption ? roleOption.label : '';
  }

  clearForm(): void {
    this.fullName.set('');
    this.email.set('');
    this.phoneNumber.set('');
    this.selectedRole.set(null);
  }

  hasAnyValue(): boolean {
    return !!(
      this.fullName().trim() ||
      this.email().trim() ||
      this.phoneNumber().trim() ||
      this.selectedRole()
    );
  }

  getErrorMessage(field: string): string | null {
    return this.fieldErrors[field] || null;
  }
}