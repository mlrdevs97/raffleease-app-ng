import { Component } from '@angular/core';
import { OrderFormComponent } from '../../components/create-order/order-form/order-form.component';
import { BackLinkComponent } from '../../../../layout/components/back-link/back-link.component';

@Component({
  selector: 'app-create-order-page',
  standalone: true,
  imports: [OrderFormComponent, BackLinkComponent],
  templateUrl: './create-order-page.component.html'
})
export class CreateOrderPageComponent { }