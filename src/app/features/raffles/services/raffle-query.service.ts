import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { RaffleSearchFilters } from '../models/raffle-search.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { Raffle } from '../models/raffle.model';

@Injectable({
    providedIn: 'root'
})
export class RaffleQueryService {
    private readonly apiUrl = `${environment.apiUrl}/associations`;
    private readonly cache = signal<Map<string, PageResponse<Raffle>>>(new Map());
    private readonly raffleCache = signal<Map<number, Raffle>>(new Map());
    private readonly isLoading = signal(false);

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    get isLoading$() {
        return this.isLoading.asReadonly();
    }

    getById(raffleId: number): Observable<Raffle> {
        const associationId = this.authService.requireAssociationId();
        const cachedRaffle = this.raffleCache().get(raffleId);

        if (cachedRaffle) {
            return of(cachedRaffle);
        }

        return this.http.get<SuccessResponse<Raffle>>(`${this.apiUrl}/${associationId}/raffles/${raffleId}`)
            .pipe(
                tap((response: SuccessResponse<Raffle>) => {
                    this.raffleCache.update((cache: Map<number, Raffle>) => {
                        const newCache = new Map(cache);
                        newCache.set(raffleId, response.data!);
                        return newCache;
                    });
                }),
                map(response => response.data!)
            );
    }

    search(
        filters: RaffleSearchFilters = {},
        page: number = 0,
        size: number = 10,
        sort: string = 'createdAt,desc'
    ): Observable<PageResponse<Raffle>> {
        const associationId = this.authService.requireAssociationId();
        const cacheKey = this.generateCacheKey(filters, page, size, sort);
        const cachedData = this.cache().get(cacheKey);

        if (cachedData) {
            return of(cachedData);
        }

        this.isLoading.set(true);

        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', sort);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params = params.set(key, value.toString());
            }
        });

        return this.http.get<SuccessResponse<PageResponse<Raffle>>>(`${this.apiUrl}/${associationId}/raffles`, { params })
            .pipe(
                tap((response: SuccessResponse<PageResponse<Raffle>>) => {
                    this.cache.update((cache: Map<string, PageResponse<Raffle>>) => {
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
        this.raffleCache.set(new Map());
    }

    private generateCacheKey(
        filters: RaffleSearchFilters,
        page: number,
        size: number,
        sort: string
    ): string {
        const parts = [
            `page=${page}`,
            `size=${size}`,
            filters?.status ? `status=${filters.status}` : '',
            filters?.title ? `title=${filters.title}` : '',
            sort ? `sort=${sort}` : ''
        ];
        return parts.filter(Boolean).join('&');
    }
} 