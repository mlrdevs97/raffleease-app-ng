import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent implements OnInit {
  isLoading = signal(false);
  isVerified = signal(false);
  errorMessage = signal<string | null>(null);
  token: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Check if there's a token in the URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.verifyEmail(this.token);
      }
    });
  }
  
  verifyEmail(token: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.authService.verifyEmail(token)
      .then(() => {
        this.isVerified.set(true);
      })
      .catch((error: Error | HttpErrorResponse) => {
        this.errorMessage.set(error instanceof Error ? error.message : 'Verification failed. Please try again.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
} 