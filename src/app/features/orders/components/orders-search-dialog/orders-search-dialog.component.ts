import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersSearchTabsComponent } from './orders-search-tabs/orders-search-tabs.component';

@Component({
    selector: 'app-orders-search-dialog',
    standalone: true,
    imports: [
        CommonModule,
        OrdersSearchTabsComponent
    ],
    templateUrl: './orders-search-dialog.component.html',
})
export class OrdersSearchDialogComponent {
    @Input() isOpen = false;
    @Output() closeDialog = new EventEmitter<void>();
    
    searchCriteria: any = {};
    
    @HostListener('document:keydown.escape', ['$event'])
    onKeydownHandler(event: KeyboardEvent): void {
        if (this.isOpen) {
            this.onClose();
        }
    }
    
    onClose(): void {
        this.closeDialog.emit();
    }
    
    onReset(): void {
        this.searchCriteria = {};
    }
    
    onSearch(): void {
        console.log('Search with criteria:', this.searchCriteria);
        // Implement search functionality here
        this.closeDialog.emit();
    }
    
    onCriteriaChange(criteria: any): void {
        this.searchCriteria = { ...criteria };
    }
}