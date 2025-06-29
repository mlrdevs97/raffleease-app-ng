import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../auth/services/auth.service';
import { User, AssociationRole } from '../../../core/models/user.model';
import { CreateUserRequest, CreateUserResponse } from '../models/create-user.model';
import { PageResponse } from '../../../core/models/pagination.model';

export interface UserSearchFilters {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
}

interface PageableRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManageAccountsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;
  private readonly cache = signal<Map<string, PageResponse<User>>>(new Map());
  private readonly userCache = signal<Map<number, User>>(new Map());
  private readonly isLoading = signal(false);

  get isLoading$() {
    return this.isLoading.asReadonly();
  }

  searchUsers(filters: UserSearchFilters, pageable?: PageableRequest): Observable<PageResponse<User>> {
    const associationId = this.authService.requireAssociationId();
    const cacheKey = this.generateCacheKey(filters, pageable);
    const cachedData = this.cache().get(cacheKey);

    if (cachedData) {
      return of(cachedData);
    }

    this.isLoading.set(true);
    
    let params = new HttpParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    
    if (pageable?.page !== undefined) {
      params = params.set('page', pageable.page.toString());
    }
    if (pageable?.size !== undefined) {
      params = params.set('size', pageable.size.toString());
    }
    if (pageable?.sort) {
      params = params.set('sort', pageable.sort);
    }

    return this.http.get<SuccessResponse<PageResponse<User>>>(
      `${this.apiUrl}/associations/${associationId}/users`,
      { params }
    ).pipe(
      tap((response: SuccessResponse<PageResponse<User>>) => {
        this.cache.update(cache => {
          const newCache = new Map(cache);
          newCache.set(cacheKey, response.data!);
          return newCache;
        });
        this.isLoading.set(false);
      }),
      map(response => response.data!),
      tap({
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }

  enableUser(userId: number): Observable<void> {
    const associationId = this.authService.requireAssociationId();
    return this.http.patch<SuccessResponse<void>>(
      `${this.apiUrl}/associations/${associationId}/users/${userId}/enable`,
      {}
    ).pipe(
      tap(() => this.invalidateUserCache(userId)),
      map(() => void 0)
    );
  }

  disableUser(userId: number): Observable<void> {
    const associationId = this.authService.requireAssociationId();
    return this.http.patch<SuccessResponse<void>>(
      `${this.apiUrl}/associations/${associationId}/users/${userId}/disable`,
      {}
    ).pipe(
      tap(() => this.invalidateUserCache(userId)),
      map(() => void 0)
    );
  }

  updateUserRole(userId: number, role: AssociationRole): Observable<User> {
    const associationId = this.authService.requireAssociationId();
    const request: UpdateUserRoleRequest = { role };
    
    return this.http.patch<SuccessResponse<User>>(
      `${this.apiUrl}/associations/${associationId}/users/${userId}/role`,
      request
    ).pipe(
      tap(response => {
        if (response.data) {
          this.updateUserCache(userId, response.data);
        }
      }),
      map(response => response.data!)
    );
  }

  createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
    const associationId = this.authService.requireAssociationId();
    
    return this.http.post<SuccessResponse<CreateUserResponse>>(
      `${this.apiUrl}/associations/${associationId}/users`,
      request
    ).pipe(
      map(response => response.data!)
    );
  }

  clearCache(): void {
    this.cache.set(new Map());
    this.userCache.set(new Map());
  }

  private updateUserCache(userId: number, updatedUser: User): void {
    this.userCache.update(cache => {
      const newCache = new Map(cache);
      newCache.set(userId, updatedUser);
      return newCache;
    });
    
    this.updateUserInSearchCache(updatedUser);
  }

  private invalidateUserCache(userId: number): void {
    this.userCache.update(cache => {
      const newCache = new Map(cache);
      newCache.delete(userId);
      return newCache;
    });
    this.clearCache();
  }

  private updateUserInSearchCache(updatedUser: User): void {
    this.cache.update(cache => {
      const newCache = new Map(cache);
      
      newCache.forEach((pageResponse, key) => {
        const updatedContent = pageResponse.content.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
        
        newCache.set(key, {
          ...pageResponse,
          content: updatedContent
        });
      });
      
      return newCache;
    });
  }

  private generateCacheKey(filters: UserSearchFilters, pageable?: PageableRequest): string {
    const parts = [
      pageable?.page !== undefined ? `page=${pageable.page}` : '',
      pageable?.size !== undefined ? `size=${pageable.size}` : '',
      filters?.fullName ? `fullName=${filters.fullName}` : '',
      filters?.email ? `email=${filters.email}` : '',
      filters?.phoneNumber ? `phoneNumber=${filters.phoneNumber}` : '',
      filters?.role ? `role=${filters.role}` : '',
      pageable?.sort ? `sort=${pageable.sort}` : ''
    ];
    return parts.filter(Boolean).join('&');
  }
} 