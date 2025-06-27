import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout-button.component.html',
})
export class LogoutButtonComponent {
  // Input signal for loading state
  isLoading = input<boolean>(false);
  
  // Output event for logout action
  logoutClicked = output<void>();

  /**
   * Handles the logout button click
   */
  onLogout(): void {
    if (this.isLoading()) return;
    this.logoutClicked.emit();
  }
}
