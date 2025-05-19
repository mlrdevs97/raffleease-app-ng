import { Component, Input, ElementRef, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Raffle } from '../../../models/raffle.model';
import { RaffleStatusLabelComponent } from '../../shared/raffle-status-label/raffle-status-label.component';

@Component({
  selector: 'app-raffle-card',
  standalone: true,
  imports: [RouterLink, RaffleStatusLabelComponent, DatePipe],
  templateUrl: './raffle-card.component.html'
})
export class RaffleCardComponent {
  @Input() raffle!: Raffle;
  menuOpen = false;
  
  constructor(
    private elementRef: ElementRef,
    private router: Router
  ) {}
  
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
    this.menuOpen = false;
  }
}
