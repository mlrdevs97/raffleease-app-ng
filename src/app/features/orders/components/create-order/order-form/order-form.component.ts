import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // For Reactive Forms

import { TicketSelectionComponent } from '../ticket-selection/ticket-selection.component';
import { CustomerInformationComponent } from '../customer-information/customer-information.component';
import { AdditionalInformationComponent } from '../additional-information/additional-information.component';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TicketSelectionComponent,
    CustomerInformationComponent,
    AdditionalInformationComponent
  ],
  templateUrl: './order-form.component.html'
})
export class OrderFormComponent implements OnInit {
  orderForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      ticketSelection: this.fb.group({
        ticketNumber: ['', Validators.required],
        ticketSearchType: ['specific'], 
        quantity: [1, [Validators.required, Validators.min(1)]]
      }),
      customerInformation: this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: this.fb.group({
          countryCode: ['+1'],
          nationalNumber: ['', Validators.required]
        })
      }),
      additionalInformation: this.fb.group({
        comment: ['', Validators.maxLength(500)]
      })
    });
  }

  get ticketSelectionGroup(): FormGroup {
    return this.orderForm.get('ticketSelection') as FormGroup;
  }

  get customerInformationGroup(): FormGroup {
    return this.orderForm.get('customerInformation') as FormGroup;
  }

  get additionalInformationGroup(): FormGroup {
    return this.orderForm.get('additionalInformation') as FormGroup;
  }
}