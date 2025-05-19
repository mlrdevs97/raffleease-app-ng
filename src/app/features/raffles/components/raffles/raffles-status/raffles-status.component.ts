import { Component, ElementRef, EventEmitter, HostListener, Output, signal } from '@angular/core';

@Component({
  selector: 'app-raffles-status',
  templateUrl: './raffles-status.component.html',
  standalone: true
})
export class RafflesStatusComponent {
  readonly statusOptions = [
    'All statuses',
    'pending',
    'active',
    'paused',
    'completed'
  ];

  isOpen = signal(false);
  selectedStatus = signal<string>('All statuses');

  @Output() statusChange = new EventEmitter<string>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleDropdown() {
    this.isOpen.update(open => !open);
  }
}
