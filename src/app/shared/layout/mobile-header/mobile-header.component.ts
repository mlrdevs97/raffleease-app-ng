import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../features/auth/services/auth.service';
import { LogoutButtonComponent } from '../../components/logout-button/logout-button.component';

export interface MenuItem {
  href: string;
  label: string;
  icon: string;
  exactMatch?: boolean;
}

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoutButtonComponent],
  templateUrl: './mobile-header.component.html'
})
export class MobileHeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  // Signal to manage mobile menu open/closed state
  isMobileMenuOpen = signal(false);
  
  // Signal to manage logout loading state
  isLoggingOut = signal(false);

  // Menu items configuration (same as side-menu for consistency)
  mainMenuItems: MenuItem[] = [
    {
      href: '/',
      label: 'Home',
      exactMatch: true,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clip-rule="evenodd" />
      </svg>`
    },
    {
      href: '/raffles',
      label: 'Raffles',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h6.5A2.25 2.25 0 0 1 13 4.25V5.5H9.25A3.75 3.75 0 0 0 5.5 9.25V13H4.25A2.25 2.25 0 0 1 2 10.75v-6.5Z" />
        <path d="M9.25 7A2.25 2.25 0 0 0 7 9.25v6.5A2.25 2.25 0 0 0 9.25 18h6.5A2.25 2.25 0 0 0 18 15.75v-6.5A2.25 2.25 0 0 0 15.75 7h-6.5Z" />
      </svg>`
    },
    {
      href: '/orders',
      label: 'Orders',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M15.75 3A2.25 2.25 0 0 1 18 5.25v1.214c0 .423-.277.788-.633 1.019A2.997 2.997 0 0 0 16 10c0 1.055.544 1.982 1.367 2.517.356.231.633.596.633 1.02v1.213A2.25 2.25 0 0 1 15.75 17H4.25A2.25 2.25 0 0 1 2 14.75v-1.213c0-.424.277-.789.633-1.02A2.998 2.998 0 0 0 4 10a2.997 2.997 0 0 0-1.367-2.517C2.277 7.252 2 6.887 2 6.463V5.25A2.25 2.25 0 0 1 4.25 3h11.5ZM13.5 7.396a.75.75 0 0 0-1.5 0v1.042a.75.75 0 0 0 1.5 0V7.396Zm0 4.167a.75.75 0 0 0-1.5 0v1.041a.75.75 0 0 0 1.5 0v-1.041Z" clip-rule="evenodd" />
      </svg>`
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 60.671 60.671" xml:space="preserve">
        <ellipse fill="currentColor" cx="30.336" cy="12.097" rx="11.997" ry="12.097"></ellipse> 
        <path fill="currentColor" d="M35.64,30.079H25.031c-7.021,0-12.714,5.739-12.714,12.821v17.771h36.037V42.9 C48.354,35.818,42.661,30.079,35.64,30.079z"></path>
      </svg>`
    }
  ];

  /**
   * Toggles the mobile menu open/closed state
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(current => !current);
  }

  /**
   * Closes the mobile menu
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  /**
   * Handles user logout
   */
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
        this.closeMobileMenu();
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
    
    // For non-exact matches, check if current URL starts with href
    // Special case: avoid matching root '/' for non-root paths
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
    const baseClasses = 'flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors';
    const isCurrentlyActive = this.isActive(href, exactMatch);
    
    if (isCurrentlyActive) {
      return `${baseClasses} text-zinc-950 bg-zinc-950/10`;
    } else {
      return `${baseClasses} text-zinc-700 hover:bg-zinc-950/5 hover:text-zinc-950`;
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
      return 'h-6 w-6 text-zinc-900';
    } else {
      return 'h-6 w-6 text-zinc-500';
    }
  }

  /**
   * Handles navigation and closes mobile menu
   * @param href - The route to navigate to
   */
  onNavigate(href: string): void {
    this.router.navigate([href]);
    this.closeMobileMenu();
  }
}
