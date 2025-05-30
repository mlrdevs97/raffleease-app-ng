import { Component, Input, ElementRef, HostListener, Output, EventEmitter, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Raffle } from '../../../features/raffles/models/raffle.model';
import { RaffleStatusLabelComponent } from '../../../features/raffles/components/shared/raffle-status-label/raffle-status-label.component';
import { RaffleService } from '../../../features/raffles/services/raffle.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ErrorCodes } from '../../../core/constants/error-codes';
import { ErrorMessages } from '../../../core/constants/error-messages';

export type RaffleCardMode = 'menu' | 'clearSelection';

@Component({
  selector: 'app-raffle-card',
  standalone: true,
  imports: [RouterLink, RaffleStatusLabelComponent, DatePipe],
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
  }

  deleteRaffle() {
    if (!this.associationId) {
      console.error('associationId is required for delete operation');
      return;
    }

    this.menuOpen = false;
    this.clearErrorMessage();
    this.isDeleting = true;
    
    this.raffleService.deleteRaffle(this.associationId, this.raffle.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deleted.emit(this.raffle.id);
      },
      error: (error) => {
        this.isDeleting = false;
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