import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-back-link',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './back-link.component.html'
})
export class BackLinkComponent {
  @Input() routePath: string = '';
  @Input() label: string = 'Back';
} 