import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  template: '<p>Verifying your email...</p>',
})
export class EmailVerificationComponent implements OnInit {
  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.authService.verifyEmail(token).subscribe({
          next: () => this.router.navigate(['/auth/login'], { queryParams: { emailVerified: 'success' } }),
          error: () => this.router.navigate(['/auth/login'])
        });
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }
} 