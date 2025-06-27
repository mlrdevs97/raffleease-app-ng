import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from '../../../features/auth/services/auth.service';
import { LogoutButtonComponent } from '../../components/logout-button/logout-button.component';
import { MenuItem } from '../../../core/models/menu.model';
import { MenuConfigService } from '../../../core/services/menu-config.service';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LogoutButtonComponent],
  templateUrl: './mobile-header.component.html',
})
export class MobileHeaderComponent implements OnInit {
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);
  private menuConfig = inject(MenuConfigService);

  isMobileMenuOpen = signal<boolean>(false);
  isLoggingOut = signal<boolean>(false);
  filteredMenuItems = signal<MenuItem[]>([]);

  currentUrl$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map((event: NavigationEnd) => event.urlAfterRedirects),
    startWith(this.router.url)
  );

  ngOnInit(): void {
    this.loadFilteredMenuItems();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(current => !current);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onNavigate(href: string): void {
    this.closeMobileMenu();
  }

  onLogout(): void {
    if (this.isLoggingOut()) return;
    
    this.isLoggingOut.set(true);
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggingOut.set(false);
        this.closeMobileMenu();
      },
      error: () => {
        this.isLoggingOut.set(false);
      }
    });
  }

  private loadFilteredMenuItems(): void {
    this.menuConfig.getFilteredMenuItems().subscribe({
      next: (menuItems) => {
        this.filteredMenuItems.set(menuItems);
      },
      error: () => {
        // Fallback to basic menu items
        this.filteredMenuItems.set(this.menuConfig.getMainMenuItems().filter(item => !item.requiredRole));
      }
    });
  }

  /**
   * Safely returns sanitized HTML for icons
   * @param iconHtml - The SVG HTML string
   * @returns SafeHtml that can be used with innerHTML
   */
  getSafeIconHtml(iconHtml: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(iconHtml);
  }

  /**
   * Determines if a menu item should be marked as active
   * @param href - The route path to check
   * @param exactMatch - Whether to use exact matching (default: false)
   * @returns true if the item should be marked as active
   */
  isActive(href: string, exactMatch: boolean = false): boolean {
    const currentUrl = this.router.url;
    
    if (exactMatch) {
      return currentUrl === href;
    }
    
    if (href === '/') {
      return currentUrl === '/';
    }
    
    return currentUrl.startsWith(href);
  }

  /**
   * Gets the appropriate CSS classes for a menu item based on its active state
   * @param href - The route path
   * @param exactMatch - Whether to use exact matching
   * @returns CSS classes string
   */
  getMenuItemClasses(href: string, exactMatch: boolean = false): string {
    const baseClasses = 'flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium';
    const isCurrentlyActive = this.isActive(href, exactMatch);
    
    if (isCurrentlyActive) {
      // Active state: using original zinc colors
      return `${baseClasses} text-zinc-950 bg-zinc-950/5 hover:bg-zinc-950/10`;
    } else {
      // Inactive state: default styling
      return `${baseClasses} text-zinc-950 hover:bg-zinc-950/5`;
    }
  }

  /**
   * Gets the appropriate CSS classes for menu item icons
   * @param href - The route path
   * @param exactMatch - Whether to use exact matching
   * @returns CSS classes string for icons
   */
  getIconClasses(href: string, exactMatch: boolean = false): string {
    const isCurrentlyActive = this.isActive(href, exactMatch);
    
    if (isCurrentlyActive) {
      return 'h-5 w-5 text-zinc-900';
    } else {
      return 'h-5 w-5 text-zinc-500';
    }
  }
}
