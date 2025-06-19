import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RafflesSearchComponent } from '../../../../raffles/components/raffles/raffles-search/raffles-search.component';
import { RaffleQueryService } from '../../../../raffles/services/raffle-query.service';
import { RaffleSearchService } from '../../../../raffles/services/raffle-search.service';
import { Raffle, RaffleStatus } from '../../../../raffles/models/raffle.model';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';
import { RaffleCardComponent } from '../../../../raffles/components/raffles/raffle-card/raffle-card.component';

@Component({
  selector: 'app-raffle-selection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RafflesSearchComponent,
    RaffleCardComponent
  ],
  templateUrl: './raffle-selection.component.html'
})
export class RaffleSelectionComponent implements OnInit, OnDestroy {
  @Input() raffleSelectionForm!: FormGroup;
  @Input() isRequired = true;
  @Input() preselectedRaffleId?: number;
  @Input() fieldErrors: Record<string, string> = {};
  
  selectedRaffle = signal<Raffle | null>(null);
  isLoading = signal(false);
  preselectedRaffleNotActive = signal(false);
  clientValidationMessages = ClientValidationMessages;
  
  constructor(
    private raffleQueryService: RaffleQueryService,
    public raffleSearchService: RaffleSearchService
  ) {}
  
  ngOnInit(): void {
    this.raffleSearchService.initializeSearch(2, 300);
    
    if (this.preselectedRaffleId) {
      this.loadPreselectedRaffle(this.preselectedRaffleId);
    }
  }

  ngOnDestroy(): void {
    this.raffleSearchService.destroySubscription();
    this.raffleSearchService.resetSearch();
  }

  private loadPreselectedRaffle(raffleId: number): void {
    this.isLoading.set(true);
    this.raffleQueryService.getById(raffleId).subscribe({
      next: (raffle: Raffle) => {
        if (this.isRaffleAvailableForOrders(raffle)) {
          this.selectedRaffle.set(raffle);
          this.raffleSelectionForm.get('raffleId')?.setValue(raffle.id);
          this.preselectedRaffleNotActive.set(false);
        } else {
          this.selectedRaffle.set(null);
          this.raffleSelectionForm.get('raffleId')?.setValue('');
          this.preselectedRaffleNotActive.set(true);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.preselectedRaffleNotActive.set(false);
      }
    });
  }

  private isRaffleAvailableForOrders(raffle: Raffle): boolean {
    return raffle.status === RaffleStatus.ACTIVE;
  }
  
  onSearchChange(searchTerm: string): void {
    this.raffleSearchService.search(searchTerm);
  }
  
  onEnterPressed(searchTerm: string): void {
    console.log('Enter pressed with term:', searchTerm);
  }
    
  onSuggestionSelected(raffle: Raffle): void {
    if (!this.isRaffleAvailableForOrders(raffle)) {
      return;
    }
    this.selectedRaffle.set(raffle);
    this.raffleSelectionForm.get('raffleId')?.setValue(raffle.id);
    this.raffleSearchService.clearSuggestions();
    this.preselectedRaffleNotActive.set(false);
  }
  
  clearSelection(): void {
    this.selectedRaffle.set(null);
    this.raffleSelectionForm.get('raffleId')?.setValue('');
    this.raffleSearchService.resetSearch();
    this.preselectedRaffleNotActive.set(false);
  }

  get showSearchSection(): boolean {
    return !this.preselectedRaffleId && !this.selectedRaffle();
  }

  get showSelectedSection(): boolean {
    return !!this.selectedRaffle() && !this.isLoading();
  }

  get suggestions() {
    return this.raffleSearchService.suggestions().filter(raffle => this.isRaffleAvailableForOrders(raffle));
  }

  get isSearchLoading() {
    return this.raffleSearchService.isSearchLoading();
  }

  get noSearchResults() {
    return this.raffleSearchService.noSearchResults();
  }

  get noActiveRafflesMessage(): string | null {
    if (this.preselectedRaffleNotActive()) {
      return this.clientValidationMessages.raffle.notAvailableForOrders;
    }
    
    const allSuggestions = this.raffleSearchService.suggestions();
    const activeSuggestions = this.suggestions;
    
    if (allSuggestions.length > 0 && activeSuggestions.length === 0) {
      return this.clientValidationMessages.raffle.notAvailableForOrders;
    }
    
    return null;
  }

  get shouldShowToast(): boolean {
    return this.preselectedRaffleNotActive() || 
           (this.raffleSearchService.suggestions().length > 0 && this.suggestions.length === 0);
  }

  getErrorMessage(fieldName: string): string | null {
    const control = this.raffleSelectionForm.get(fieldName);
    if (!control?.touched || !control.errors) return null;

    if (control.errors['required']) {
      return this.clientValidationMessages.common.required;
    } else if (control.errors['serverError']) {
      return this.fieldErrors[fieldName] || this.clientValidationMessages.common.serverError;
    }
    
    return null;
  }
} 