import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-between items-center">
      <div class="text-sm text-slate-500">
        Showing {{ startIndex }}-{{ endIndex }} of {{ pagination.totalElements }} items
      </div>

      <div class="flex space-x-2">
        <button 
          [disabled]="pagination.currentPage === 0" 
          (click)="onPageChange(pagination.currentPage - 1)"
          class="px-3 py-1 rounded border hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none">
          Previous
        </button>
        <button 
          [disabled]="pagination.currentPage === pagination.totalPages - 1"
          (click)="onPageChange(pagination.currentPage + 1)"
          class="px-3 py-1 rounded border hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none">
          Next
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input({ required: true }) pagination!: PaginationInfo;
  @Output() pageChange = new EventEmitter<number>();

  get startIndex(): number {
    return this.pagination.currentPage * this.pagination.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(
      (this.pagination.currentPage + 1) * this.pagination.pageSize,
      this.pagination.totalElements
    );
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
} 