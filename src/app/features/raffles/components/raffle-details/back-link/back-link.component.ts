import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-back-link',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './back-link.component.html'
})
export class BackLinkComponent {
  @Input() label!: string;
  @Input() link!: string;
} 