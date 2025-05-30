import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, throwError } from 'rxjs';
import { Cart } from '../../../core/models/cart.model';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = `${environment.apiUrl}/associations`;
  
  // Current cart state
  private currentCart = signal<Cart | null>(null);
  private isCreatingCart = signal(false);
  private isReservingTickets = signal(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get the current cart as a readonly signal
   */
  getCurrentCart() {
    return this.currentCart.asReadonly();
  }

  /**
   * Get the cart creation loading state
   */
  getIsCreatingCart() {
    return this.isCreatingCart.asReadonly();
  }

  /**
   * Get the ticket reservation loading state
   */
  getIsReservingTickets() {
    return this.isReservingTickets.asReadonly();
  }

  /**
   * Create a new cart for the current association
   */
  createCart(): Observable<Cart> {
    const associationId = this.authService.requireAssociationId();
    
    this.isCreatingCart.set(true);

    return this.http.post<SuccessResponse<Cart>>(
      `${this.baseUrl}/${associationId}/carts`,
      {} // Empty body for POST request
    ).pipe(
      map(response => response.data!),
      tap(cart => {
        this.currentCart.set(cart);
        this.isCreatingCart.set(false);
      })
    );
  }

  /**
   * Reserve tickets in the current cart
   * @param ticketIds Array of ticket IDs to reserve
   * @returns Observable with the updated cart
   */
  reserveTickets(ticketIds: number[]): Observable<Cart> {
    const cart = this.currentCart();
    if (!cart) {
      return throwError(() => new Error('No cart available for reservation'));
    }

    const associationId = this.authService.requireAssociationId();
    this.isReservingTickets.set(true);

    return this.http.post<SuccessResponse<Cart>>(
      `${this.baseUrl}/${associationId}/carts/${cart.id}/reservations`,
      { ticketIds }
    ).pipe(
      map(response => response.data!),
      tap(updatedCart => {
        this.currentCart.set(updatedCart);
        this.isReservingTickets.set(false);
      })
    );
  }

  /**
   * Clear the current cart state
   */
  clearCart(): void {
    this.currentCart.set(null);
  }

  /**
   * Reset the creating cart loading state
   */
  resetCreatingState(): void {
    this.isCreatingCart.set(false);
  }

  /**
   * Reset the reserving tickets loading state
   */
  resetReservingState(): void {
    this.isReservingTickets.set(false);
  }

  /**
   * Get the cart ID if available
   */
  getCartId(): number | null {
    return this.currentCart()?.id || null;
  }
} 