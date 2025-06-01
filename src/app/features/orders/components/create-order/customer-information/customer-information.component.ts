import { Component, Input, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownSelectComponent } from '../../../../../shared/components/dropdown-select/dropdown-select.component';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';

interface CountryCode {
    code: string;
    dialCode: string;
    name: string;
}

@Component({
    selector: 'app-customer-information',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        DropdownSelectComponent
    ],
    templateUrl: './customer-information.component.html'
})
export class CustomerInformationComponent implements AfterViewInit {
    @Input() customerInformationForm!: FormGroup;
    @Input() fieldErrors: Record<string, string> = {};
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

    clientValidationMessages = ClientValidationMessages;

    constructor() {
        this.countryCodes = this.countryCodeOptions.map(country => {
            const formattedCode = `${country.code} (${country.dialCode})`;
            this.displayToValueMap.set(formattedCode, country.dialCode);
            this.valueToDisplayMap.set(country.dialCode, formattedCode);
            return formattedCode;
        });
    }

    ngAfterViewInit(): void {
        const currentValue = this.customerInformationForm.get('phoneNumber.countryCode')?.value;

        if (!currentValue) {
            const usOption = this.countryCodes.find(code => code.startsWith('US'));
            if (usOption) {
                const dialCode = this.displayToValueMap.get(usOption);
                if (dialCode) {
                    this.customerInformationForm.get('phoneNumber.countryCode')?.setValue(dialCode);
                    if (this.countryCodeDropdown) {
                        this.countryCodeDropdown.value = usOption;
                    }
                }
            }
        } else if (currentValue.startsWith('+')) {
            const displayValue = this.valueToDisplayMap.get(currentValue);
            if (displayValue && this.countryCodeDropdown) {
                this.countryCodeDropdown.value = displayValue;
            }
        }

        if (this.countryCodeDropdown) {
            this.countryCodeDropdown.registerOnChange((selectedDisplay: string) => {
                if (selectedDisplay) {
                    const dialCode = this.displayToValueMap.get(selectedDisplay);
                    if (dialCode) {
                        this.customerInformationForm.get('phoneNumber.countryCode')?.setValue(dialCode, { emitEvent: false });
                        this.countryCodeDropdown.value = selectedDisplay;
                    }
                }
            });
        }
    }

    getErrorMessage(fieldName: string): string | null {
        const control = this.customerInformationForm.get(fieldName);
        if (!control?.touched || !control.errors) return null;

        if (control.errors['required']) {
            if (fieldName === 'phoneNumber.countryCode') {
                return this.clientValidationMessages.phone.countryCodeRequired;
            } else if (fieldName === 'phoneNumber.nationalNumber') {
                return this.clientValidationMessages.phone.nationalNumberRequired;
            }
            return this.clientValidationMessages.common.required;
        } else if (control.errors['email']) {
            return this.clientValidationMessages.common.email;
        } else if (control.errors['maxlength']) {
            return this.clientValidationMessages.common.maxlength(control.errors['maxlength'].requiredLength);
        } else if (control.errors['pattern']) {
            if (fieldName === 'phoneNumber.countryCode') {
                return this.clientValidationMessages.phone.countryCodePattern;
            } else if (fieldName === 'phoneNumber.nationalNumber') {
                return this.clientValidationMessages.phone.nationalNumberPattern;
            }
            return this.clientValidationMessages.common.pattern;
        } else if (control.errors['serverError']) {
            return this.fieldErrors[fieldName] || this.clientValidationMessages.common.serverError;
        }
        
        return null;
    }
}