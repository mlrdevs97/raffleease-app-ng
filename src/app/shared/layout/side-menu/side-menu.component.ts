import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { filter, map, startWith } from 'rxjs/operators';

export interface MenuItem {
  href: string;
  label: string;
  icon: string;
  exactMatch?: boolean;
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-menu.component.html',
})
export class SideMenuComponent {
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  // Menu items configuration to avoid repetition
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
      href: '/settings',
      label: 'Settings',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
      </svg>`
    }
  ];

  upcomingRaffles = [
    { href: '/raffles/1', label: 'Bear Hug: Live in Concert' },
    { href: '/raffles/2', label: 'Six Fingers — DJ Set' },
    { href: '/raffles/3', label: 'We All Look The Same' },
    { href: '/raffles/4', label: 'Viking People' }
  ];

  // Track current URL for active state
  currentUrl$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map((event: NavigationEnd) => event.urlAfterRedirects),
    startWith(this.router.url)
  );

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
