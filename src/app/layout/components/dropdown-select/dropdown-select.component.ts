import { Component, Input, Self, Optional, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-dropdown-select',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './dropdown-select.component.html',
})
export class DropdownSelectComponent implements ControlValueAccessor {
    @Input() options: string[] = [];
    @Input() placeholder: string = 'Select an option';
    @Input() displayAllOption: boolean = true;

    isOpen: boolean = false;
    value: string = '';
    isDisabled: boolean = false;
    private onChange: (value: string) => void = () => {};
    onTouched: () => void = () => {};

    constructor(
        @Optional() @Self() public ngControl: NgControl,
        private elementRef: ElementRef
    ) {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    writeValue(value: any): void {
        if (value !== undefined && value !== null) {
            // Check if the value is one of the options
            const matchedOption = this.options.find(opt => opt === value);
            if (matchedOption) {
                this.value = matchedOption;
            } else {
                // If the value is not in options, it might be the raw value
                this.value = value;
            }
        } else {
            this.value = '';
        }
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    onSelectionChange(event: Event): void {
        const selectedValue = (event.target as HTMLSelectElement).value;
        this.value = selectedValue;
        this.onChange(selectedValue);
        this.onTouched();
    }

    toggleDropdown(): void {
        if (!this.isDisabled) {
            this.isOpen = !this.isOpen;
        }
    }

    selectOption(option: string): void {
        this.value = option;
        this.onChange(option);
        this.onTouched();
        this.isOpen = false;
    }

    get displayValue(): string {
        return this.value || this.placeholder;
    }
    
    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
            this.isOpen = false;
        }
    }
    
    // Close dropdown when pressing ESC key
    @HostListener('document:keydown.escape', ['$event'])
    onEscKeydown(event: KeyboardEvent): void {
        if (this.isOpen) {
            this.isOpen = false;
            event.preventDefault();
        }
    }
} 