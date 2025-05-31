import { Component, Input, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaffleStatusLabelComponent } from '../../shared/raffle-status-label/raffle-status-label.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { RaffleStatus } from '../../../models/raffle.model';
import { RaffleService } from '../../../services/raffle.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { SuccessMessages } from '../../../../../core/constants/success-messages';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';
import { SuccessResponse } from '../../../../../core/models/api-response.model';
import { Raffle } from '../../../models/raffle.model';

@Component({
  selector: 'app-raffle-header',
  imports: [CommonModule, RaffleStatusLabelComponent, ConfirmationDialogComponent],
  standalone: true,
  templateUrl: './raffle-header.component.html'
})
export class RaffleHeaderComponent {
  @Input() raffle!: Raffle;
  @Output() raffleUpdated = new EventEmitter<Raffle>();
  @Output() editRequested = new EventEmitter<void>();

  isUpdatingStatus = signal(false);
  showConfirmationDialog = signal(false);
  currentAction = signal<'activate' | 'pause' | 'reactivate' | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Enum reference for template usage
  readonly RaffleStatus = RaffleStatus;

  constructor(
    private raffleService: RaffleService,
    private errorHandler: ErrorHandlerService
  ) {}

  get formattedStatus(): string {
    return this.raffle.status.charAt(0) + this.raffle.status.slice(1).toLowerCase();
  }

  get confirmationDialogData(): ConfirmationDialogData {
    const action = this.currentAction();
    switch (action) {
      case 'activate':
        return ClientValidationMessages.raffle.confirmActivation;
      case 'pause':
        return ClientValidationMessages.raffle.confirmPause;
      case 'reactivate':
        return ClientValidationMessages.raffle.confirmReactivation;
      default:
        return ClientValidationMessages.raffle.confirmActivation; // fallback
    }
  }

  onEditClicked(): void {
    this.editRequested.emit();
  }

  onActivateClicked(): void {
    this.currentAction.set('activate');
    this.showConfirmationDialog.set(true);
    this.resetMessages();
  }

  onPauseClicked(): void {
    this.currentAction.set('pause');
    this.showConfirmationDialog.set(true);
    this.resetMessages();
  }

  onReactivateClicked(): void {
    this.currentAction.set('reactivate');
    this.showConfirmationDialog.set(true);
    this.resetMessages();
  }

  onConfirmationConfirmed(): void {
    const action = this.currentAction();
    if (!action) return;

    this.isUpdatingStatus.set(true);
    this.showConfirmationDialog.set(false);
    this.resetMessages();

    const newStatus = this.getNewStatusForAction(action);
    const successMessage = this.getSuccessMessageForAction(action);

    this.raffleService.updateRaffleStatus(this.raffle.id, { status: newStatus }).subscribe({
      next: (response: SuccessResponse<Raffle>) => {
        this.successMessage.set(successMessage);
        if (response.data) {
          // Update the local raffle data to reflect the status change
          this.raffle = { ...this.raffle, status: response.data.status };
          // Emit the updated raffle data to parent components
          this.raffleUpdated.emit(response.data);
        }
        this.isUpdatingStatus.set(false);
        this.currentAction.set(null);
        
        // Clear success message after 5 seconds
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.isUpdatingStatus.set(false);
        this.currentAction.set(null);
        
        // Clear error message after 8 seconds
        setTimeout(() => this.errorMessage.set(null), 8000);
      }
    });
  }

  onConfirmationCancelled(): void {
    this.showConfirmationDialog.set(false);
    this.currentAction.set(null);
    this.resetMessages();
  }

  private getNewStatusForAction(action: 'activate' | 'pause' | 'reactivate'): RaffleStatus {
    switch (action) {
      case 'activate':
      case 'reactivate':
        return RaffleStatus.ACTIVE;
      case 'pause':
        return RaffleStatus.PAUSED;
      default:
        return RaffleStatus.ACTIVE;
    }
  }

  private getSuccessMessageForAction(action: 'activate' | 'pause' | 'reactivate'): string {
    switch (action) {
      case 'activate':
        return SuccessMessages.raffle.activated;
      case 'pause':
        return SuccessMessages.raffle.paused;
      case 'reactivate':
        return SuccessMessages.raffle.reactivated;
      default:
        return SuccessMessages.raffle.activated;
    }
  }

  private resetMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
} 