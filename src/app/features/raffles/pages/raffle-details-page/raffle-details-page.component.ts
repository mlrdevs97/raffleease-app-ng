import { Component, OnInit, signal, computed, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EMPTY, Subject, takeUntil } from 'rxjs';
import { RaffleStatisticsComponent } from '../../components/raffle-details/raffle-statistics/raffle-statistics.component';
import { RaffleGalleryComponent } from '../../components/raffle-details/raffle-gallery/raffle-gallery.component';
import { RaffleHeaderComponent } from '../../components/raffle-details/raffle-header/raffle-header.component';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { Raffle } from '../../models/raffle.model';
import { RaffleQueryService } from '../../services/raffle-query.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { RaffleOrdersComponent } from '../../components/raffle-details/raffle-orders/raffle-orders.component';
import { ErrorMessages } from '../../../../core/constants/error-messages';
import { RaffleStatisticsUpdateService } from '../../../../core/services/raffle-statistics-update.service';

@Component({
  selector: 'app-raffle-details-page',
  standalone: true,
  imports: [
    CommonModule,
    BackLinkComponent,
    RaffleGalleryComponent,
    RaffleHeaderComponent,
    RaffleOrdersComponent,
    RaffleStatisticsComponent
  ],
  templateUrl: './raffle-details-page.component.html'
})
export class RaffleDetailsPageComponent implements OnInit, OnDestroy {
  raffle = signal<Raffle | null>(null);
  isLoading = signal(false);
  initialSuccessMessage = signal<string | null>(null);
  private readonly destroy$ = new Subject<void>();
  private readonly raffleStatsUpdateService = inject(RaffleStatisticsUpdateService);
  private currentRaffleId: number | null = null;

  timePassed = computed(() => {
    const raffleData = this.raffle();
    if (!raffleData) return '';

    const start = new Date(raffleData.startDate);
    const now = new Date();
    const diff = Math.max(0, Math.floor((+now - +start) / (1000 * 60 * 60 * 24)));
    return `${diff} day${diff !== 1 ? 's' : ''}`;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private raffleQueryService: RaffleQueryService,
    private errorHandler: ErrorHandlerService
  ) {
    // Listen for raffle statistics updates for the current raffle
    this.raffleStatsUpdateService.raffleUpdates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedRaffleId: number) => {
        // Only reload if this is the raffle currently being viewed
        if (this.currentRaffleId === updatedRaffleId) {
          this.reloadRaffleData();
        }
      });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.loadRaffleData(params['id']);
    });

    this.route.queryParams.subscribe((params: Params) => {
      if (params['success']) {
        this.initialSuccessMessage.set(params['success']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEditRequested(): void {
    const raffleData = this.raffle();
    if (raffleData) {
      this.router.navigate(['/raffles', raffleData.id, 'edit']);
    }
  }

  onRaffleUpdated(updatedRaffle: Raffle): void {
    this.raffle.set(updatedRaffle);
  }

  /**
   * Reloads raffle data without showing loading state
   * Used when order operations update raffle statistics
   */
  private reloadRaffleData(): void {
    if (!this.currentRaffleId) return;

    // Force refresh by invalidating cache and fetching fresh data
    this.raffleQueryService.invalidateRaffleCache(this.currentRaffleId);
    
    this.raffleQueryService.getById(this.currentRaffleId).subscribe({
      next: (raffle) => {
        this.raffle.set(raffle);
      },
      error: (error) => {
        console.error('Error reloading raffle data:', error);
        // Don't show error to user for background refreshes
      }
    });
  }

  private loadRaffleData(raffleId: string): void {
    if (!raffleId || isNaN(Number(raffleId))) {
      this.router.navigate(['/raffles'], { 
        queryParams: { error: ErrorMessages.dedicated['raffle']['NOT_FOUND'] } 
      });
      return;
    }

    this.currentRaffleId = Number(raffleId);
    this.isLoading.set(true);

    this.raffleQueryService.getById(this.currentRaffleId).subscribe({
      next: (raffle) => {
        this.raffle.set(raffle);
      },
      error: (error) => {
        console.error('Error loading raffle details:', error);
        this.router.navigate(['/raffles'], { 
          queryParams: { error: this.errorHandler.getErrorMessage(error) } 
        });
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}