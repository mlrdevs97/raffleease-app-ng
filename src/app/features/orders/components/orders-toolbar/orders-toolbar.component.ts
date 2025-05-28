import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-orders-toolbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders-toolbar.component.html',
})
export class OrdersToolbarComponent {
  @Output() searchClick = new EventEmitter<void>();

  onSearchClick(): void {
    this.searchClick.emit();
  }
} 