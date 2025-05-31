import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-comment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-comment.component.html'
})
export class OrderCommentComponent {
  @Input() order!: Order;
  
  commentText: string = '';
  isEditing: boolean = false;

  ngOnInit(): void {
    this.commentText = this.order?.comment || '';
  }

  onSaveComment(): void {
    console.log('Saving comment:', this.commentText);
    // Here you would typically call a service to save the comment
    this.isEditing = false;
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.commentText = this.order?.comment || '';
    this.isEditing = false;
  }
} 