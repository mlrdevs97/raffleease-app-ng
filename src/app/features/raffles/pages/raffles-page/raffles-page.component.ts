import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RafflesHeaderComponent } from '../../components/raffles/raffles-header/raffles-header.component';
import { RaffleCardListComponent } from '../../components/raffles/raffle-card-list/raffle-card-list.component';
import { Raffle } from '../../models/raffle.model';
import { RaffleQueryService } from '../../services/raffle-query.service';
import { RaffleSearchResponse } from '../../models/raffle-search.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-raffles-page',
  standalone: true,
  imports: [CommonModule, RafflesHeaderComponent, RaffleCardListComponent],
  templateUrl: './raffles-page.component.html',
})
export class RafflesPageComponent implements OnInit {
  raffles = signal<Raffle[]>([]);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = 20;
  errorMessage = signal<string | null>(null);
  protected readonly Math = Math;

  constructor(
    public raffleQueryService: RaffleQueryService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadRaffles();
  }

  loadRaffles(page: number = 0): void {
    this.currentPage.set(page);
    this.errorMessage.set(null);
    this.raffleQueryService.search(page, this.pageSize).subscribe({
      next: (response: RaffleSearchResponse) => {
        this.raffles.set(response.content);
        this.totalElements.set(response.totalElements);
      },
      error: (error) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.raffles.set([]);
        this.totalElements.set(0);
      }
    });
  }

  onPageChange(page: number): void {
    this.loadRaffles(page);
  }
} 
