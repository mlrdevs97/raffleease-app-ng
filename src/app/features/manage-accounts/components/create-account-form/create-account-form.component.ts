import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';
import { DropdownSelectComponent } from '../../../../shared/components/dropdown-select/dropdown-select.component';

@Component({
  selector: 'app-create-account-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, DropdownSelectComponent, ReactiveFormsModule],
  templateUrl: './create-account-form.component.html',
  styles: ``
})
export class CreateAccountFormComponent {

}
