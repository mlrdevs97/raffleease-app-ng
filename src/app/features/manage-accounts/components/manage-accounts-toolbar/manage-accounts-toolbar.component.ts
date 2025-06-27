import { Component, Output, EventEmitter, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { UsersService } from '../../../../core/services/users.service';
import { User, AssociationRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-manage-accounts-toolbar',
  standalone: true,
  imports: [ButtonComponent, RouterModule, CommonModule],
  templateUrl: './manage-accounts-toolbar.component.html',
  styles: ``
})
export class ManageAccountsToolbarComponent implements OnInit {
  @Output() searchClick = new EventEmitter<void>();
  
  private readonly usersService = inject(UsersService);
  
  currentUser = signal<User | null>(null);
  userRole = signal<string>('');
  isAdmin = computed(() => this.userRole() === AssociationRole.ADMIN);

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  onSearchClick(): void {
    this.searchClick.emit();
  }

  private loadCurrentUser(): void {
    this.usersService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.userRole.set(user.role);
      }
    });
  }
}
