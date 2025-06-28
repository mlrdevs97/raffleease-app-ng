import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RaffleStatisticsUpdateService {
  private readonly raffleUpdatesSubject = new Subject<number>();

  /**
   * Observable that emits raffle IDs when their statistics need to be updated
   */
  readonly raffleUpdates$ = this.raffleUpdatesSubject.asObservable();

  /**
   * Signal that tracks the last update timestamp for debugging purposes
   */
  readonly lastUpdateTimestamp = signal<number | null>(null);

  /**
   * Notifies that a raffle's statistics should be updated due to order changes
   * @param raffleId The ID of the raffle whose statistics need updating
   */
  notifyRaffleStatisticsUpdate(raffleId: number): void {
    this.lastUpdateTimestamp.set(Date.now());
    this.raffleUpdatesSubject.next(raffleId);
  }

  /**
   * Cleanup method for proper resource management
   */
  destroy(): void {
    this.raffleUpdatesSubject.complete();
  }
} 