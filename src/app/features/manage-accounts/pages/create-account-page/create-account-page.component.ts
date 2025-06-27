import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { CreateAccountFormComponent } from '../../components/create-account-form/create-account-form.component';

@Component({
  selector: 'app-create-account-page',
  standalone: true,
  imports: [BackLinkComponent, CreateAccountFormComponent, CommonModule],
  templateUrl: './create-account-page.component.html',
  styles: ``
})
export class CreateAccountPageComponent implements OnInit {
  successMessage = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage.set(params['message']);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }
}
