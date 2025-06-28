import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout-button.component.html',
})
export class LogoutButtonComponent {
  isLoading = input<boolean>(false);  
  logoutClicked = output<void>();

  onLogout(): void {
    if (this.isLoading()) return;
    this.logoutClicked.emit();
  }
}
