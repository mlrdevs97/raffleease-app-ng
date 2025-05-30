import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RafflesSearchComponent } from '../../../../raffles/components/raffles/raffles-search/raffles-search.component';
import { RaffleQueryService } from '../../../../raffles/services/raffle-query.service';
import { RaffleSearchService } from '../../../../raffles/services/raffle-search.service';
import { Raffle } from '../../../../raffles/models/raffle.model';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';
import { RaffleCardComponent } from '../../../../../layout/components/raffle-card/raffle-card.component';

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
  isLoadingPreselected = signal(false);
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
    this.isLoadingPreselected.set(true);
    this.raffleQueryService.getById(raffleId).subscribe({
      next: (raffle: Raffle) => {
        this.selectedRaffle.set(raffle);
        this.raffleSelectionForm.get('raffleId')?.setValue(raffle.id);
        this.isLoadingPreselected.set(false);
      },
      error: () => {
        this.isLoadingPreselected.set(false);
      }
    });
  }
  
  onSearchChange(searchTerm: string): void {
    this.raffleSearchService.search(searchTerm);
  }
  
  onEnterPressed(searchTerm: string): void {
    console.log('Enter pressed with term:', searchTerm);
  }
    
  onSuggestionSelected(raffle: Raffle): void {
    this.selectedRaffle.set(raffle);
    this.raffleSelectionForm.get('raffleId')?.setValue(raffle.id);
    this.raffleSearchService.clearSuggestions();
  }
  
  clearSelection(): void {
    this.selectedRaffle.set(null);
    this.raffleSelectionForm.get('raffleId')?.setValue('');
    this.raffleSearchService.resetSearch();
  }

  get showSearchSection(): boolean {
    return !this.preselectedRaffleId && !this.selectedRaffle();
  }

  get showSelectedSection(): boolean {
    return !!this.selectedRaffle() && !this.isLoadingPreselected();
  }

  get suggestions() {
    return this.raffleSearchService.suggestions();
  }

  get isSearchLoading() {
    return this.raffleSearchService.isSearchLoading();
  }

  get noSearchResults() {
    return this.raffleSearchService.noSearchResults();
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