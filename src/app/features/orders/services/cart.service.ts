import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, throwError, catchError, finalize, of } from 'rxjs';
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
  private isReleasingTickets = signal(false);

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
   * Get the ticket release loading state
   */
  getIsReleasingTickets() {
    return this.isReleasingTickets.asReadonly();
  }

  /**
   * Create a new cart for the current association
   */
  createCart(): Observable<Cart> {
    const associationId = this.authService.requireAssociationId();
    
    this.isCreatingCart.set(true);

    return this.http.post<SuccessResponse<Cart>>(`${this.baseUrl}/${associationId}/carts`, {}).pipe(
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
   * Release tickets from the current cart
   * @param ticketIds Array of ticket IDs to release
   * @returns Observable with success response
   */
  releaseTickets(ticketIds: number[]): Observable<void> {
    const cart = this.currentCart();
    if (!cart) {
      this.clearCart();
      return of(undefined);
    }

    const associationId = this.authService.requireAssociationId();
    this.isReleasingTickets.set(true);

    return this.http.put<SuccessResponse<void>>(
      `${this.baseUrl}/${associationId}/carts/${cart.id}/reservations`,
      { ticketIds }
    ).pipe(
      map(response => response.data!),
      tap(() => {
        if (cart.tickets) {
          cart.tickets = cart.tickets.filter(ticket => !ticketIds.includes(ticket.id));
          this.currentCart.set(cart);
        }
      }),
      finalize(() => {
        this.isReleasingTickets.set(false);
      }),
    );
  }

  /**
   * Release all tickets from the current cart and clear it
   * @returns Observable with success response
   */
  releaseAllTicketsAndClearCart(): Observable<void> {
    const cart = this.currentCart();
    if (!cart) {
      this.clearCart();
      return of(undefined);
    }

    const associationId = this.authService.requireAssociationId();
    this.isReleasingTickets.set(true);

    const allTicketIds = cart.tickets?.map(ticket => ticket.id) || [];
    if (allTicketIds.length === 0) {
      this.clearCart();
      this.isReleasingTickets.set(false);
      return of(undefined);
    }

    return this.http.put<SuccessResponse<void>>(
      `${this.baseUrl}/${associationId}/carts/${cart.id}/reservations`,
      { ticketIds: allTicketIds }
    ).pipe(
      map((response: SuccessResponse<void>) => response.data!),
      finalize(() => {
        this.isReleasingTickets.set(false);
        this.clearCart();
      }),
    );
  }

  /**
   * Get current cart from server to check for existing reservations
   * This is useful when page reloads and we need to check server state
   */
  getUserActiveCart(): Observable<Cart | null> {
    const associationId = this.authService.requireAssociationId();
    return this.http.get<SuccessResponse<Cart>>(`${this.baseUrl}/${associationId}/carts/active`).pipe(
      map((response: SuccessResponse<Cart>) => response.data!),
      tap((cart: Cart) => this.currentCart.set(cart)),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        throw error;
      })
    ) as Observable<Cart | null>;
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
   * Reset the releasing tickets loading state
   */
  resetReleasingState(): void {
    this.isReleasingTickets.set(false);
  }

  /**
   * Get the cart ID if available
   */
  getCartId(): number | null {
    return this.currentCart()?.id || null;
  }
}