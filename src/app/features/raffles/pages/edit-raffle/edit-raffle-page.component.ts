import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { RaffleFormComponent } from '../../components/create-raffles/raffle-form/raffle-form.component';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { Raffle } from '../../models/raffle.model';
import { RaffleQueryService } from '../../services/raffle-query.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ErrorMessages } from '../../../../core/constants/error-messages';

@Component({
  selector: 'app-edit-raffle-page',
  standalone: true,
  imports: [RaffleFormComponent, BackLinkComponent],
  templateUrl: './edit-raffle-page.component.html'
})
export class EditRafflePageComponent implements OnInit {
  raffle = signal<Raffle | null>(null);
  isLoading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private raffleQueryService: RaffleQueryService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
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
} 