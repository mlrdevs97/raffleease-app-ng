import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ProfilesService } from '../../services/profiles.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { UserProfile, AssociationRole } from '../../models/profile.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  private readonly profilesService = inject(ProfilesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  @Input() user!: UserProfile;
  @Output() userUpdated = new EventEmitter<UserProfile>();

  isUpdatingStatus = signal(false);
  errorMessage = signal<string | null>(null);

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
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  getPhoneNumber(): string {
    const phone = this.user.phoneNumber;
    return phone ? `${phone.prefix} ${phone.nationalNumber}` : 'Not provided';
  }

  toggleUserStatus(): void {
    if (this.isUpdatingStatus()) return;

    this.isUpdatingStatus.set(true);
    this.errorMessage.set(null);

    const operation = this.user.isEnabled 
      ? this.profilesService.disableUser(this.user.id)
      : this.profilesService.enableUser(this.user.id);

    operation.subscribe({
      next: () => {
        const updatedUser: UserProfile = {
          ...this.user,
          isEnabled: !this.user.isEnabled
        };
        this.userUpdated.emit(updatedUser);
        this.isUpdatingStatus.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.isUpdatingStatus.set(false);
      }
    });
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
} 