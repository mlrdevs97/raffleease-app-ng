import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Needed for *ngFor for select options
import { DropdownSelectComponent } from '../../../../../layout/components/dropdown-select/dropdown-select.component';

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
export class CustomerInformationComponent implements OnInit, AfterViewInit {
    @Input() customerInformationForm!: FormGroup;
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
    
    constructor() {
        this.countryCodes = this.countryCodeOptions.map(country => {
            const formattedCode = `${country.code} (${country.dialCode})`;
            this.displayToValueMap.set(formattedCode, country.dialCode);
            this.valueToDisplayMap.set(country.dialCode, formattedCode);
            return formattedCode;
        });
    }
    
    ngOnInit(): void {
        // Initialize component - actual setup happens in ngAfterViewInit
    }
    
    ngAfterViewInit(): void {
        // Wait for the view to be initialized and then set the default value
        setTimeout(() => {
            // Get the current form value
            const currentValue = this.customerInformationForm.get('phoneNumber.countryCode')?.value;
            
            // If there's no value yet, set the default to US (+1)
            if (!currentValue) {
                const usOption = this.countryCodes.find(code => code.startsWith('US'));
                if (usOption) {
                    // Get the dial code for US
                    const dialCode = this.displayToValueMap.get(usOption);
                    if (dialCode) {
                        // Set only the dial code in the form
                        this.customerInformationForm.get('phoneNumber.countryCode')?.setValue(dialCode);
                        
                        // Also set the display value in the dropdown component
                        if (this.countryCodeDropdown) {
                            this.countryCodeDropdown.value = usOption;
                        }
                    }
                }
            } else if (currentValue.startsWith('+')) {
                // If the current value is already a dial code, find the display value
                const displayValue = this.valueToDisplayMap.get(currentValue);
                if (displayValue && this.countryCodeDropdown) {
                    // Set the display value in the dropdown component
                    this.countryCodeDropdown.value = displayValue;
                }
            }
            
            // Subscribe to selection changes in the dropdown
            if (this.countryCodeDropdown) {
                this.countryCodeDropdown.registerOnChange((selectedDisplay: string) => {
                    if (selectedDisplay) {
                        // Convert the display value to the actual dial code
                        const dialCode = this.displayToValueMap.get(selectedDisplay);
                        if (dialCode) {
                            // Update the form with just the dial code
                            this.customerInformationForm.get('phoneNumber.countryCode')?.setValue(dialCode, { emitEvent: false });
                            
                            // Ensure the dropdown's internal value stays as the display value
                            this.countryCodeDropdown.value = selectedDisplay;
                        }
                    }
                });
            }
        });
    }
}