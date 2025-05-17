import { Component, Input, ElementRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-raffle-card',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './raffle-card.component.html'
})
export class RaffleCardComponent {
  @Input() raffle!: any;

  menuOpen = false;
  
  constructor(private elementRef: ElementRef) {}
  
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
  }

  editRaffle() {
    this.menuOpen = false;
  }

  deleteRaffle() {
    this.menuOpen = false;
  }
}
