import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent {
  email: string | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { email: string };
    this.email = state?.email || null;

    if (!this.email) {
      this.router.navigate(['/auth']);
    }
  }
}
