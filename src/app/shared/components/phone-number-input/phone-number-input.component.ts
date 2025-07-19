import { Component, Input, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DropdownSelectComponent } from '../dropdown-select/dropdown-select.component';

interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
}

@Component({
  selector: 'app-phone-number-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownSelectComponent],
  templateUrl: './phone-number-input.component.html'
})
export class PhoneNumberInputComponent implements OnInit, AfterViewInit {
  @Input() label: string = 'Phone Number';
  @Input() placeholder: string = 'Enter phone number';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showLabel: boolean = true;
  @Input() prefixControl!: FormControl;
  @Input() nationalNumberControl!: FormControl;
  @ViewChild('countryCodeDropdown') countryCodeDropdown!: DropdownSelectComponent;

  countryCodes: string[] = [];
  countryCodeOptions: CountryCode[] = [
    { code: 'US', dialCode: '+1', name: 'United States' },
    { code: 'CA', dialCode: '+1', name: 'Canada' },
    { code: 'UK', dialCode: '+44', name: 'United Kingdom' },
    { code: 'AU', dialCode: '+61', name: 'Australia' },
    { code: 'FR', dialCode: '+33', name: 'France' },
    { code: 'DE', dialCode: '+49', name: 'Germany' },
    { code: 'JP', dialCode: '+81', name: 'Japan' },
    { code: 'CN', dialCode: '+86', name: 'China' },
    { code: 'IN', dialCode: '+91', name: 'India' },
    { code: 'MX', dialCode: '+52', name: 'Mexico' },
    { code: 'BR', dialCode: '+55', name: 'Brazil' },
    { code: 'ES', dialCode: '+34', name: 'Spain' },
    { code: 'IT', dialCode: '+39', name: 'Italy' }
  ];

  private displayToValueMap = new Map<string, string>();
  private valueToDisplayMap = new Map<string, string>();
  public defaultValue: string = '';

  constructor() {
    this.countryCodes = this.countryCodeOptions.map(country => {
      const formattedCode = `${country.code} (${country.dialCode})`;
      this.displayToValueMap.set(formattedCode, country.dialCode);
      this.valueToDisplayMap.set(country.dialCode, formattedCode);
      return formattedCode;
    });
    
    const usOption = this.countryCodes.find(code => code.startsWith('US'));
    if (usOption) {
      this.defaultValue = usOption;
    }
  }

  ngOnInit(): void {
    if (this.prefixControl && !this.prefixControl.value) {
      const usOption = this.countryCodes.find(code => code.startsWith('US'));
      if (usOption) {
        const dialCode = this.displayToValueMap.get(usOption);
        if (dialCode) {
          this.prefixControl.setValue(dialCode, { emitEvent: false });
        }
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.countryCodeDropdown) {
      this.countryCodeDropdown.registerOnChange((selectedDisplay: string) => {
        this.onCountryCodeChange(selectedDisplay);
      });
      
      if (this.prefixControl && !this.prefixControl.value) {
        const dialCode = this.displayToValueMap.get(this.defaultValue);
        if (dialCode) {
          this.prefixControl.setValue(dialCode, { emitEvent: false });
        }
        this.countryCodeDropdown.writeValue(this.defaultValue);
      } else if (this.prefixControl && this.prefixControl.value) {
        const displayValue = this.valueToDisplayMap.get(this.prefixControl.value);
        if (displayValue) {
          this.countryCodeDropdown.writeValue(displayValue);
        }
      }
    }
  }

  onCountryCodeChange(selectedDisplay: string): void {
    if (selectedDisplay && this.prefixControl) {
      const dialCode = this.displayToValueMap.get(selectedDisplay);
      if (dialCode) {
        this.prefixControl.setValue(dialCode, { emitEvent: false });
        this.countryCodeDropdown.value = selectedDisplay;
      }
    }
  }

  getErrorMessage(fieldName: string): string | null {
    const control = fieldName === 'prefix' ? this.prefixControl : this.nationalNumberControl;
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['serverError']) {
      const groupError = this.getPhoneNumberGroupError();
      if (groupError) {
        return null;
      }
      return control.errors['serverError'];
    }

    // Check client-side validation errors
    if (control.errors['required']) {
      if (fieldName === 'prefix') {
        return 'Country code is required';
      } else if (fieldName === 'nationalNumber') {
        return 'Phone number is required';
      }
      return 'This field is required';
    } else if (control.errors['pattern']) {
      if (fieldName === 'prefix') {
        return 'Invalid country code format (e.g., +1)';
      } else if (fieldName === 'nationalNumber') {
        return 'Invalid phone number format';
      }
      return 'Invalid format';
    }

    return null;
  }

  getPhoneNumberGroupError(): string | null {
    const prefixError = this.prefixControl?.errors?.['serverError'];
    const nationalNumberError = this.nationalNumberControl?.errors?.['serverError'];
    
    if (prefixError && nationalNumberError && prefixError === nationalNumberError) {
      return prefixError;
    }
    
    return null;
  }

  get isInvalid(): boolean {
    return (this.prefixControl?.invalid && this.prefixControl?.touched) || 
           (this.nationalNumberControl?.invalid && this.nationalNumberControl?.touched) || false;
  }
} 