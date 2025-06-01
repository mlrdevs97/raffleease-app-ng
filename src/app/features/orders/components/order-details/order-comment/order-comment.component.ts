import { Component, Input, OnInit, signal, computed, inject, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order } from '../../../models/order.model';
import { OrdersService } from '../../../services/orders.service';
import { CommentRequest } from '../../../models/comment-request.model';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationMessages } from '../../../../../core/constants/confirmation-messages';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-order-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent, ButtonComponent],
  templateUrl: './order-comment.component.html'
})
export class OrderCommentComponent implements OnInit, OnChanges {
  @Input() order!: Order;
  @Output() orderUpdated = new EventEmitter<Order>();
  
  private ordersService = inject(OrdersService);
  
  commentText = signal('');
  originalCommentText = signal('');
  isLoading = signal(false);
  isEditing = signal(false);  
  currentOrderComment = signal<string | null>(null);
  hasComment = computed(() => Boolean(this.currentOrderComment()));
  isTextChanged = computed(() => 
    this.commentText() !== this.originalCommentText() && 
    this.commentText().trim() !== ''
  );
  
  // Computed for textarea styling
  textareaClasses = computed(() => {
    const baseClasses = 'flex min-h-[80px] rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2 w-full transition-colors';
    
    if (this.hasComment() && !this.isEditing()) {
      return `${baseClasses} bg-slate-100`;
    }
    return `${baseClasses} bg-background`;
  });
  
  // Confirmation dialog state
  showConfirmDialog = signal(false);
  confirmDialogData = signal<ConfirmationDialogData>({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default'
  });
  
  // Track current operation for confirmation
  pendingOperation: 'delete' | 'edit' | null = null;

  ngOnInit(): void {
    this.initializeComment();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] && this.order) {
      this.initializeComment();
    }
  }

  private initializeComment(): void {
    const comment = this.order?.comment || '';
    this.commentText.set(comment);
    this.originalCommentText.set(comment);
    this.currentOrderComment.set(this.order?.comment || null);
  }

  onSaveComment(): void {
    if (!this.commentText().trim()) return;

    const commentRequest: CommentRequest = {
      comment: this.commentText().trim()
    };

    this.isLoading.set(true);

    const operation = this.hasComment() 
      ? this.ordersService.editComment(this.order.id, commentRequest)
      : this.ordersService.addComment(this.order.id, commentRequest);

    operation.subscribe({
      next: (updatedOrder: Order) => {
        this.orderUpdated.emit(updatedOrder);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error saving comment:', error);
        this.isLoading.set(false);
      }
    });
  }

  onEditComment(): void {
    this.pendingOperation = 'edit';
    this.confirmDialogData.set({
      ...ConfirmationMessages.comment.confirmEdit
    });
    this.showConfirmDialog.set(true);
  }

  onDeleteComment(): void {
    this.pendingOperation = 'delete';
    this.confirmDialogData.set({
      ...ConfirmationMessages.comment.confirmDelete
    });
    this.showConfirmDialog.set(true);
  }

  onConfirmAction(): void {
    if (this.pendingOperation === 'delete') {
      this.executeDelete();
    } else if (this.pendingOperation === 'edit') {
      this.executeEdit();
    }
    this.closeConfirmDialog();
  }

  onCancelAction(): void {
    this.closeConfirmDialog();
  }

  private executeDelete(): void {
    this.isLoading.set(true);
    
    this.ordersService.deleteComment(this.order.id).subscribe({
      next: () => {
        const updatedOrder: Order = { ...this.order, comment: null };
        this.orderUpdated.emit(updatedOrder);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        this.isLoading.set(false);
      }
    });
  }

  private executeEdit(): void {
    if (!this.commentText().trim()) return;

    const commentRequest: CommentRequest = {
      comment: this.commentText().trim()
    };

    this.isLoading.set(true);

    this.ordersService.editComment(this.order.id, commentRequest).subscribe({
      next: (updatedOrder: Order) => {
        this.orderUpdated.emit(updatedOrder);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error editing comment:', error);
        this.isLoading.set(false);
      }
    });
  }

  private closeConfirmDialog(): void {
    this.showConfirmDialog.set(false);
    this.pendingOperation = null;
  }


  onTextareaFocus(): void {
    this.isEditing.set(true);
  }

  onTextareaBlur(): void {
    this.isEditing.set(false);
  }
} 