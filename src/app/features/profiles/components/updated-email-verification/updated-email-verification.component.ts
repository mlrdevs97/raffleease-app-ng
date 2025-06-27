import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfilesService } from '../../services/profiles.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-updated-email-verification',
  standalone: true,
  template: '', 
})
export class UpdatedEmailVerificationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly profilesService = inject(ProfilesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.verifyEmailUpdate(token);
      } else {
        this.redirectToProfile('error', 'Invalid verification link');
      }
    });
  }

  private verifyEmailUpdate(token: string): void {
    this.profilesService.verifyEmailUpdate({ token }).subscribe({
      next: () => {
        this.redirectToProfile('success');
      },
      error: (error) => {
        const errorMessage = this.errorHandler.getErrorMessage(error);
        this.redirectToProfile('error', errorMessage);
      }
    });
  }

  private redirectToProfile(status: 'success' | 'error', errorMessage?: string): void {
    const queryParams: any = { emailUpdated: status };
    if (errorMessage) {
      queryParams.errorMessage = errorMessage;
    }
    this.router.navigate(['/profile'], { queryParams });
  }
}
