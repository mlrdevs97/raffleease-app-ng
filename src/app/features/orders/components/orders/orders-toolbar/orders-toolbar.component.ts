import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-orders-toolbar',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './orders-toolbar.component.html',
})
export class OrdersToolbarComponent {
  @Output() searchClick = new EventEmitter<void>();

  onSearchClick(): void {
    this.searchClick.emit();
  }
} 