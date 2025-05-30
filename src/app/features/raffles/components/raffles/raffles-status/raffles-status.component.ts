import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownSelectComponent } from '../../../../../layout/components/dropdown-select/dropdown-select.component';

@Component({
  selector: 'app-raffles-status',
  templateUrl: './raffles-status.component.html',
  standalone: true,
  imports: [DropdownSelectComponent, FormsModule]
})
export class RafflesStatusComponent {
  readonly statusOptions = [
    'pending',
    'active',
    'paused',
    'completed'
  ];

  selectedStatus: string = 'ANY';

  @Output() statusChange = new EventEmitter<string>();

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.statusChange.emit(status);
  }
}
