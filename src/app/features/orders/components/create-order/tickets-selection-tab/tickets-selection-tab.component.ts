import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-ticket-selection-tabs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tickets-selection-tab.component.html'
})
export class TicketSelectionTabsComponent {
    @Input() selectedTab: 'specific' | 'random' = 'specific';
    @Output() tabSelected = new EventEmitter<'specific' | 'random'>();

    selectTab(tab: 'specific' | 'random'): void {
        if (this.selectedTab !== tab) { 
            this.selectedTab = tab; 
            this.tabSelected.emit(tab);
        }
    }
}