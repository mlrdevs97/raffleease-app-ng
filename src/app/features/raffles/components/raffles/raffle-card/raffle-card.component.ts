import { Component, Input, ElementRef, HostListener, Output, EventEmitter, OnDestroy, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Raffle } from '../../../models/raffle.model';
import { RaffleStatusLabelComponent } from '../../shared/raffle-status-label/raffle-status-label.component';
import { RaffleService } from '../../../services/raffle.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { ErrorCodes } from '../../../../../core/constants/error-codes';
import { ErrorMessages } from '../../../../../core/constants/error-messages';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationMessages } from '../../../../../core/constants/confirmation-messages';

export type RaffleCardMode = 'menu' | 'clearSelection';

@Component({
  selector: 'app-raffle-card',
  standalone: true,
  imports: [RouterLink, RaffleStatusLabelComponent, DatePipe, CurrencyPipe, ConfirmationDialogComponent],
  templateUrl: './raffle-card.component.html'
})
export class RaffleCardComponent implements OnDestroy {
  @Input() raffle!: Raffle;
  @Input() associationId?: number;
  @Input() mode: RaffleCardMode = 'menu';
  @Input() clearSelectionLabel = 'Change';
  @Input() showStatus?: boolean;
  @Output() deleted = new EventEmitter<number>();
  @Output() clearSelection = new EventEmitter<void>();
  
  menuOpen = false;
  isDeleting = false;
  errorMessage: string | null = null;
  private errorTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Confirmation dialog state
  showDeleteConfirmation = signal(false);
  showEditConfirmation = signal(false);
  deleteConfirmationLoading = signal(false);
  editConfirmationLoading = signal(false);
  
  // Confirmation dialog data from centralized messages
  deleteConfirmationData: ConfirmationDialogData = ConfirmationMessages.raffle.confirmDeletion;
  editConfirmationData: ConfirmationDialogData = ConfirmationMessages.raffle.confirmEdit;
  
  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private raffleService: RaffleService,
    private errorHandler: ErrorHandlerService
  ) {}
  
  get shouldShowStatus(): boolean {
    return this.showStatus !== undefined ? this.showStatus : this.mode === 'menu';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  viewRaffle() {
    this.menuOpen = false;
    this.router.navigate(['/raffles', this.raffle.id]);
  }

  editRaffle() {
    this.menuOpen = false;
    this.showEditConfirmation.set(true);
  }

  deleteRaffle() {
    this.menuOpen = false;
    this.showDeleteConfirmation.set(true);
  }
  
  // Confirmation dialog handlers
  onEditConfirmed() {
    this.editConfirmationLoading.set(true);
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      this.editConfirmationLoading.set(false);
      this.showEditConfirmation.set(false);
      
      // Navigate to edit page
      this.router.navigate(['/raffles', this.raffle.id, 'edit']);
    }, 500);
  }
  
  onEditCancelled() {
    this.showEditConfirmation.set(false);
    this.editConfirmationLoading.set(false);
  }
  
  onDeleteConfirmed() {
    this.deleteConfirmationLoading.set(true);
    this.clearErrorMessage();
    
    this.raffleService.deleteRaffle(this.raffle.id).subscribe({
      next: () => {
        this.deleteConfirmationLoading.set(false);
        this.showDeleteConfirmation.set(false);
        this.deleted.emit(this.raffle.id);
      },
      error: (error) => {
        this.deleteConfirmationLoading.set(false);
        this.showDeleteConfirmation.set(false);
        this.errorMessage = this.errorHandler.getErrorMessage(error);
        
        if (this.errorHandler.isErrorOfType(error, ErrorCodes.BUSINESS_ERROR)) {
          const cannotDeleteMessage = ErrorMessages.dedicated['raffle']?.['CANNOT_DELETE'];
          const businessErrorMessage = ErrorMessages.general['BUSINESS_ERROR'];
          this.errorMessage = cannotDeleteMessage || businessErrorMessage || 'Operation failed';
        }
        
        // Auto-close error message after 3 seconds
        this.errorTimeout = setTimeout(() => {
          this.clearErrorMessage();
        }, 3000);
      }
    });
  }
  
  onDeleteCancelled() {
    this.showDeleteConfirmation.set(false);
    this.deleteConfirmationLoading.set(false);
  }

  onClearSelection() {
    this.clearSelection.emit();
  }
  
  clearErrorMessage(): void {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
    this.errorMessage = null;
  }
  
  ngOnDestroy(): void {
    this.clearErrorMessage();
  }
} 