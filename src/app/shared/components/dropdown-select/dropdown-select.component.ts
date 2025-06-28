import { Component, Input, Self, Optional, ElementRef, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
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
    @ViewChild('optionsContainer', { static: false }) optionsContainer!: ElementRef<HTMLDivElement>;

    isOpen: boolean = false;
    value: string = '';
    isDisabled: boolean = false;
    focusedIndex: number = -1;
    
    private onChange: (value: string) => void = () => {};
    onTouched: () => void = () => {};

    constructor(
        @Optional() @Self() public ngControl: NgControl,
        private elementRef: ElementRef,
        private cdr: ChangeDetectorRef
    ) {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    writeValue(value: any): void {
        if (value !== undefined && value !== null && value !== '') {
            const matchedOption = this.options.find(opt => opt === value);
            if (matchedOption) {
                this.value = matchedOption;
            } else {
                this.value = value;
            }
        } else {
            this.value = '';
        }
        
        this.cdr.markForCheck();
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
            if (this.isOpen) {
                // Reset focused index when opening dropdown
                this.focusedIndex = -1;
                // Set focus to the current selected option if any
                this.setFocusToSelectedOption();
            }
        }
    }

    selectOption(option: string): void {
        const valueToEmit = option === 'ANY' ? '' : option;
        this.value = valueToEmit;
        this.onChange(valueToEmit);
        this.onTouched();
        this.isOpen = false;
        this.focusedIndex = -1;        
        this.cdr.markForCheck();
    }

    get displayValue(): string {
        if (!this.value && this.displayAllOption) {
            return 'ANY';
        }
        return this.value || this.placeholder;
    }

    get allOptions(): string[] {
        const options = [...this.options];
        if (this.displayAllOption) {
            options.unshift('ANY');
        }
        return options;
    }

    isOptionSelected(option: string): boolean {
        if (option === 'ANY') {
            return !this.value; 
        }
        return this.value === option;
    }

    isOptionFocused(option: string): boolean {
        const allOptions = this.allOptions;
        return this.focusedIndex >= 0 && allOptions[this.focusedIndex] === option;
    }

    private setFocusToSelectedOption(): void {
        const allOptions = this.allOptions;
        let selectedIndex = -1;
        
        if (!this.value && this.displayAllOption) {
            selectedIndex = allOptions.findIndex(option => option === 'ANY');
        } else if (this.value) {
            selectedIndex = allOptions.findIndex(option => option === this.value);
        }
        
        if (selectedIndex >= 0) {
            this.focusedIndex = selectedIndex;
        }
    }

    private focusNextOption(): void {
        const allOptions = this.allOptions;
        if (allOptions.length === 0) return;

        if (this.focusedIndex === -1) {
            this.focusedIndex = 0;
        } else if (this.focusedIndex < allOptions.length - 1) {
            this.focusedIndex++;
        } else {
            this.focusedIndex = 0;
        }

        this.scrollFocusedOptionIntoView();
    }

    private focusPreviousOption(): void {
        const allOptions = this.allOptions;
        if (allOptions.length === 0) return;

        if (this.focusedIndex === -1) {
            this.focusedIndex = allOptions.length - 1;
        } else if (this.focusedIndex > 0) {
            this.focusedIndex--;
        } else {
            this.focusedIndex = allOptions.length - 1;
        }

        // Scroll thefocused option into view
        this.scrollFocusedOptionIntoView();
    }

    private scrollFocusedOptionIntoView(): void {
        if (this.focusedIndex < 0) return;

        setTimeout(() => {
            const container = this.elementRef.nativeElement.querySelector('[role="presentation"].overflow-auto');
            if (!container) return;

            const focusedOptionId = `option-${this.focusedIndex}`;
            const focusedElement = document.getElementById(focusedOptionId);
            
            if (!focusedElement) return;

            const containerRect = container.getBoundingClientRect();
            const elementRect = focusedElement.getBoundingClientRect();
            const elementTop = elementRect.top - containerRect.top + container.scrollTop;
            const elementBottom = elementTop + elementRect.height;
            const containerScrollTop = container.scrollTop;
            const containerScrollBottom = containerScrollTop + container.clientHeight;

            if (elementTop < containerScrollTop) {
                container.scrollTop = elementTop;
            } else if (elementBottom > containerScrollBottom) {
                container.scrollTop = elementBottom - container.clientHeight;
            }
        }, 0);
    }

    private selectFocusedOption(): void {
        const allOptions = this.allOptions;
        if (this.focusedIndex >= 0 && this.focusedIndex < allOptions.length) {
            const selectedOption = allOptions[this.focusedIndex];
            this.selectOption(selectedOption);
        }
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
            this.isOpen = false;
            this.focusedIndex = -1;
        }
    }
    
    @HostListener('document:keydown.escape', ['$event'])
    onEscKeydown(event: KeyboardEvent): void {
        if (this.isOpen) {
            this.isOpen = false;
            this.focusedIndex = -1;
            event.preventDefault();
        }
    }

    @HostListener('keydown.arrowdown', ['$event'])
    onArrowDown(event: KeyboardEvent): void {
        if (this.isOpen) {
            event.preventDefault();
            this.focusNextOption();
        } else if (!this.isDisabled) {
            event.preventDefault();
            this.toggleDropdown();
        }
    }

    @HostListener('keydown.arrowup', ['$event'])
    onArrowUp(event: KeyboardEvent): void {
        if (this.isOpen) {
            event.preventDefault();
            this.focusPreviousOption();
        } else if (!this.isDisabled) {
            event.preventDefault();
            this.toggleDropdown();
        }
    }

    @HostListener('keydown.enter', ['$event'])
    onEnterKey(event: KeyboardEvent): void {
        if (this.isOpen && this.focusedIndex >= 0) {
            event.preventDefault();
            this.selectFocusedOption();
        } else if (!this.isOpen && !this.isDisabled) {
            event.preventDefault();
            this.toggleDropdown();
        }
    }

    @HostListener('keydown.space', ['$event'])
    onSpaceKey(event: KeyboardEvent): void {
        if (this.isOpen && this.focusedIndex >= 0) {
            event.preventDefault();
            this.selectFocusedOption();
        } else if (!this.isOpen && !this.isDisabled) {
            event.preventDefault();
            this.toggleDropdown();
        }
    }
} 