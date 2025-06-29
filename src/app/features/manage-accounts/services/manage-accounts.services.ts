import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../auth/services/auth.service';
import { User, AssociationRole } from '../../../core/models/user.model';
import { CreateUserRequest, CreateUserResponse } from '../models/create-user.model';

export interface UserSearchFilters {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
}

export interface SearchResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
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

  searchUsers(filters: UserSearchFilters, pageable?: PageableRequest): Observable<SearchResult<User>> {
    const associationId = this.authService.requireAssociationId();
    
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

    return this.http.get<SuccessResponse<SearchResult<User>>>(
      `${this.apiUrl}/associations/${associationId}/users`,
      { params }
    ).pipe(
      map(response => response.data!)
    );
  }

  enableUser(userId: number): Observable<void> {
    const associationId = this.authService.requireAssociationId();
    return this.http.patch<SuccessResponse<void>>(
      `${this.apiUrl}/associations/${associationId}/users/${userId}/enable`,
      {}
    ).pipe(
      map(() => void 0)
    );
  }

  disableUser(userId: number): Observable<void> {
    const associationId = this.authService.requireAssociationId();
    return this.http.patch<SuccessResponse<void>>(
      `${this.apiUrl}/associations/${associationId}/users/${userId}/disable`,
      {}
    ).pipe(
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
} 