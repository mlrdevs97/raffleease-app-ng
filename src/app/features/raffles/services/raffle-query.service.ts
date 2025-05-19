import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { RaffleSearchFilters, RaffleSearchResponse } from '../models/raffle-search.model';

@Injectable({
    providedIn: 'root'
})
export class RaffleQueryService {
    private readonly apiUrl = `${environment.apiUrl}/associations`;
    private readonly cache = signal<Map<string, RaffleSearchResponse>>(new Map());
    private readonly isLoading = signal(false);

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    get isLoading$() {
        return this.isLoading.asReadonly();
    }

    search(
        page: number = 0,
        size: number = 20,
        filters?: RaffleSearchFilters
    ): Observable<RaffleSearchResponse> {
        const associationId = this.authService.getAssociationId();
        const cacheKey = this.generateCacheKey(page, size, filters);
        const cachedData = this.cache().get(cacheKey);

        if (cachedData) {
            return of(cachedData);
        }

        this.isLoading.set(true);

        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filters?.status) {
            params = params.set('status', filters.status);
        }
        if (filters?.searchTerm) {
            params = params.set('search', filters.searchTerm);
        }
        if (filters?.sortBy) {
            params = params.set('sort', `${filters.sortBy},${filters.sortDirection || 'asc'}`);
        }

        return this.http.get<SuccessResponse<RaffleSearchResponse>>(`${this.apiUrl}/${associationId}/raffles`, { params })
            .pipe(
                tap((response: SuccessResponse<RaffleSearchResponse>) => {
                    this.cache.update((cache: Map<string, RaffleSearchResponse>) => {
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

    clearCache(): void {
        this.cache.set(new Map());
    }

    private generateCacheKey(
        page: number,
        size: number,
        filters?: RaffleSearchFilters
    ): string {
        const parts = [
            `page=${page}`,
            `size=${size}`,
            filters?.status ? `status=${filters.status}` : '',
            filters?.searchTerm ? `search=${filters.searchTerm}` : '',
            filters?.sortBy ? `sort=${filters.sortBy},${filters.sortDirection || 'asc'}` : ''
        ];
        return parts.filter(Boolean).join('&');
    }
} 