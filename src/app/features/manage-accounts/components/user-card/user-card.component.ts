import { Component, Input, Output, EventEmitter, signal, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DropdownSelectComponent } from '../../../../shared/components/dropdown-select/dropdown-select.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AssociationRole, User } from '../../../../core/models/user.model';
import { ManageAccountsService } from '../../../manage-accounts/services/manage-accounts.services';
import { ConfirmationMessages } from '../../../../core/constants/confirmation-messages';
import { SuccessMessages } from '../../../../core/constants/success-messages';
import { formatName } from '../../../../core/utils/text-format.utils';

type ConfirmationType = 'role' | 'status';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DropdownSelectComponent, ConfirmationDialogComponent, ReactiveFormsModule],
  templateUrl: './user-card.component.html',
})
export class UserCardComponent implements OnInit, OnDestroy {
  private readonly manageAccountsService = inject(ManageAccountsService);
  private readonly errorHandler = inject(ErrorHandlerService);

  @Input() user!: User;
  @Output() userUpdated = new EventEmitter<User>();

  isUpdatingStatus = signal(false);
  isUpdatingRole = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showConfirmDialog = signal(false);
  selectedRole = signal<string>('');
  confirmationType = signal<ConfirmationType>('role');
  
  roleOptions = [AssociationRole.MEMBER, AssociationRole.COLLABORATOR];
  roleControl = new FormControl('');

  confirmDialogData: ConfirmationDialogData = {
    ...ConfirmationMessages.userManagement.confirmRoleUpdate
  };

  // Writable signal for loading state in confirmation dialog
  isConfirmationLoading = signal(false);

  private messageTimeoutId?: number;

  ngOnInit(): void {
    this.roleControl.setValue(this.user.role);
    
    this.roleControl.valueChanges.subscribe(newRole => {
      if (newRole && newRole !== this.user.role) {
        this.onRoleChange(newRole);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.messageTimeoutId) {
      clearTimeout(this.messageTimeoutId);
    }
  }

  private showTemporaryMessage(message: string, type: 'success' | 'error', duration: number = 3000): void {
    if (this.messageTimeoutId) {
      clearTimeout(this.messageTimeoutId);
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (type === 'success') {
      this.successMessage.set(message);
    } else {
      this.errorMessage.set(message);
    }

    this.messageTimeoutId = window.setTimeout(() => {
      this.successMessage.set(null);
      this.errorMessage.set(null);
      this.messageTimeoutId = undefined;
    }, duration);
  }

  getRoleClass(role: AssociationRole): string {
    switch (role) {
      case AssociationRole.ADMIN:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case AssociationRole.MEMBER:
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case AssociationRole.COLLABORATOR:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  }

  getRoleLabel(role: AssociationRole): string {
    switch (role) {
      case AssociationRole.ADMIN:
        return 'Admin';
      case AssociationRole.MEMBER:
        return 'Member';
      case AssociationRole.COLLABORATOR:
        return 'Collaborator';
      default:
        return 'Unknown';
    }
  }

  getFullName(): string {
    const fullName = `${this.user.firstName} ${this.user.lastName}`;
    return formatName(fullName);
  }

  getPhoneNumber(): string {
    const phone = this.user.phoneNumber;
    return phone ? `${phone.prefix} ${phone.nationalNumber}` : 'Not provided';
  }

  toggleUserStatus(): void {
    if (this.isUpdatingStatus()) return;
    
    this.confirmationType.set('status');
    this.updateConfirmDialogData();
    this.showConfirmDialog.set(true);
  }

  private executeStatusToggle(): void {
    this.isUpdatingStatus.set(true);

    const operation = this.user.isEnabled 
      ? this.manageAccountsService.disableUser(this.user.id)
      : this.manageAccountsService.enableUser(this.user.id);

    operation.subscribe({
      next: () => {
        const updatedUser: User = {
          ...this.user,
          isEnabled: !this.user.isEnabled
        };
        this.userUpdated.emit(updatedUser);
        this.isUpdatingStatus.set(false);
        this.isConfirmationLoading.set(false);
        this.showConfirmDialog.set(false);
        this.showTemporaryMessage(SuccessMessages.userManagement.statusUpdated, 'success');
      },
      error: (error: any) => {
        this.isUpdatingStatus.set(false);
        this.isConfirmationLoading.set(false);
        this.showConfirmDialog.set(false);
        this.showTemporaryMessage(this.errorHandler.getErrorMessage(error), 'error');
      }
    });
  }

  private updateConfirmDialogData(): void {
    if (this.confirmationType() === 'status') {
      this.confirmDialogData = this.user.isEnabled 
        ? { ...ConfirmationMessages.userManagement.confirmDisableUser }
        : { ...ConfirmationMessages.userManagement.confirmEnableUser };
    } else {
      this.confirmDialogData = { ...ConfirmationMessages.userManagement.confirmRoleUpdate };
    }
  }

  getStatusButtonText(): string {
    if (this.isUpdatingStatus()) {
      return this.user.isEnabled ? 'Disabling...' : 'Enabling...';
    }
    return this.user.isEnabled ? 'Disable User' : 'Enable User';
  }

  getStatusButtonVariant(): 'primary' | 'destructive' {
    return this.user.isEnabled ? 'destructive' : 'primary';
  }

  onRoleChange(newRole: string): void {
    if (newRole === this.user.role || newRole === 'ANY' || !newRole) {
      return;
    }

    this.selectedRole.set(newRole);
    this.confirmationType.set('role');
    this.updateConfirmDialogData();
    this.showConfirmDialog.set(true);
  }

  onConfirmAction(): void {
    this.isConfirmationLoading.set(true);
    
    if (this.confirmationType() === 'role') {
      this.executeRoleUpdate();
    } else {
      this.executeStatusToggle();
    }
  }

  onCancelAction(): void {
    this.showConfirmDialog.set(false);
    this.isConfirmationLoading.set(false);
    
    if (this.confirmationType() === 'role') {
      this.selectedRole.set('');
      this.roleControl.setValue(this.user.role, { emitEvent: false });
    }
  }

  private executeRoleUpdate(): void {
    const newRole = this.selectedRole();
    if (!newRole) return;

    this.isUpdatingRole.set(true);

    this.manageAccountsService.updateUserRole(this.user.id, newRole as AssociationRole).subscribe({
      next: (updatedUser: User) => {
        this.userUpdated.emit(updatedUser);
        this.isUpdatingRole.set(false);
        this.isConfirmationLoading.set(false);
        this.showConfirmDialog.set(false);
        this.selectedRole.set('');
        this.roleControl.setValue(updatedUser.role, { emitEvent: false });
        this.showTemporaryMessage(SuccessMessages.userManagement.roleUpdated, 'success');
      },
      error: (error: any) => {
        this.isUpdatingRole.set(false);
        this.isConfirmationLoading.set(false);
        this.showConfirmDialog.set(false);
        this.selectedRole.set('');
        this.roleControl.setValue(this.user.role, { emitEvent: false });
        this.showTemporaryMessage(this.errorHandler.getErrorMessage(error), 'error');
      }
    });
  }

  onConfirmRoleUpdate(): void {
    this.onConfirmAction();
  }

  onCancelRoleUpdate(): void {
    this.onCancelAction();
  }

  getCurrentRoleForDropdown(): string {
    return this.user.role;
  }
} 