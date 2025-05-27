import { Component, Input, Self, Optional } from '@angular/core';
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

    constructor(@Optional() @Self() public ngControl: NgControl) {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    writeValue(value: any): void {
        this.value = value !== undefined && value !== null ? value : '';
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
        this.isOpen = !this.isOpen;
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
} 