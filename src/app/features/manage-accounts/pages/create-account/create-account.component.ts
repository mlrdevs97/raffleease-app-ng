import { Component } from '@angular/core';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { CreateAccountFormComponent } from '../../components/create-account-form/create-account-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [BackLinkComponent, CreateAccountFormComponent, CommonModule],
  templateUrl: './create-account.component.html',
  styles: ``
})
export class CreateAccountComponent {

}
