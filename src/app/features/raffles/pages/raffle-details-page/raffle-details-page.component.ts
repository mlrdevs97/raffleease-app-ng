import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EMPTY } from 'rxjs';
import { RaffleStatisticsComponent } from '../../components/raffle-details/raffle-statistics/raffle-statistics.component';
import { RaffleGalleryComponent } from '../../components/raffle-details/raffle-gallery/raffle-gallery.component';
import { RaffleHeaderComponent } from '../../components/raffle-details/raffle-header/raffle-header.component';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { Raffle } from '../../models/raffle.model';
import { RaffleQueryService } from '../../services/raffle-query.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { RaffleOrdersComponent } from '../../components/raffle-details/raffle-orders/raffle-orders.component';
import { ErrorMessages } from '../../../../core/constants/error-messages';

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
export class RaffleDetailsPageComponent implements OnInit {
  raffle = signal<Raffle | null>(null);
  isLoading = signal(false);
  initialSuccessMessage = signal<string | null>(null);

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
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['success']) {
        this.initialSuccessMessage.set(params['success']);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });

    this.route.params.subscribe({
      next: (params: Params) => {
        const raffleId = parseInt(params['id'], 10);

        if (isNaN(raffleId)) {
          this.router.navigate(['/raffles'], {
            queryParams: { error: ErrorMessages.dedicated['raffle']['NOT_FOUND'] }
          });
          return EMPTY;
        }

        this.isLoading.set(true);

        return this.raffleQueryService.getById(raffleId).subscribe({
          next: (raffle: Raffle) => {
            this.raffle.set(raffle);
            this.isLoading.set(false);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.router.navigate(['/raffles'], {
              queryParams: { error: this.errorHandler.getErrorMessage(error) }
            });
          }
        });
      },
      error: (error) => {
        this.router.navigate(['/raffles'], {
          queryParams: { error: this.errorHandler.getErrorMessage(error) }
        });
      }
    });
  }

  onRaffleUpdated(updatedRaffle: Raffle): void {
    this.raffle.set(updatedRaffle);
  }

  onEditRequested(): void {
    const currentRaffle = this.raffle();
    if (currentRaffle) {
      this.router.navigate(['/raffles', currentRaffle.id, 'edit']);
    }
  }
}