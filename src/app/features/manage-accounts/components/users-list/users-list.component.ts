import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCardComponent } from '../user-card/user-card.component';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  templateUrl: './users-list.component.html',
})
export class UsersListComponent {
  @Input() users: User[] = [];
  @Input() isInSearchMode: boolean = false;
  @Output() userUpdated = new EventEmitter<User>();

  onUserUpdated(user: User): void {
    this.userUpdated.emit(user);
  }
}