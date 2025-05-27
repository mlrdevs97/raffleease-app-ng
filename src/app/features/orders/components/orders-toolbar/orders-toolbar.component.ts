import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersSearchDialogComponent } from '../orders-search-dialog/orders-search-dialog.component';

@Component({
  selector: 'app-orders-toolbar',
  standalone: true,
  imports: [CommonModule, RouterLink, OrdersSearchDialogComponent],
  templateUrl: './orders-toolbar.component.html',
})
export class OrdersToolbarComponent {
  isSearchDialogOpen = false;

  toggleSearchDialog(): void {
    this.isSearchDialogOpen = !this.isSearchDialogOpen;
  }
} 