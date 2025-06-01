import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { MobileHeaderComponent } from '../mobile-header/mobile-header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SideMenuComponent,
    MobileHeaderComponent
  ],
  templateUrl: './main-container.component.html',
})
export class MainLayoutComponent {} 