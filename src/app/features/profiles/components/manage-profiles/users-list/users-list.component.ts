import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCardComponent } from '../user-card/user-card.component';
import { ProfilesService } from '../../../services/profiles.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { UserProfile } from '../../../models/profile.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  templateUrl: './users-list.component.html',
})
export class UsersListComponent implements OnInit {
  private readonly profilesService = inject(ProfilesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  users = signal<UserProfile[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.profilesService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  onUserUpdated(updatedUser: UserProfile): void {
    this.users.update(users => 
      users.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
  }

  refreshUsers(): void {
    this.loadUsers();
  }
} 