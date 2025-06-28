import { Component, Input, Self, Optional, ElementRef, HostListener, ViewChild } from '@angular/core';
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
        private elementRef: ElementRef
    ) {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    writeValue(value: any): void {
        if (value !== undefined && value !== null) {
            const matchedOption = this.options.find(opt => opt === value);
            if (matchedOption) {
                this.value = matchedOption;
            } else {
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
            if (this.isOpen) {
                // Reset focused index when opening dropdown
                this.focusedIndex = -1;
                // Set focus to the current selected option if any
                this.setFocusToSelectedOption();
            }
        }
    }

    selectOption(option: string): void {
        this.value = option;
        this.onChange(option);
        this.onTouched();
        this.isOpen = false;
        this.focusedIndex = -1;
    }

    get displayValue(): string {
        return this.value || this.placeholder;
    }

    /**
     * Get all available options including 'ANY' if displayAllOption is true
     */
    get allOptions(): string[] {
        const options = [...this.options];
        if (this.displayAllOption) {
            options.unshift('ANY');
        }
        return options;
    }

    /**
     * Check if an option is currently focused
     */
    isOptionFocused(option: string): boolean {
        const allOptions = this.allOptions;
        return this.focusedIndex >= 0 && allOptions[this.focusedIndex] === option;
    }

    /**
     * Set focus to the currently selected option when dropdown opens
     */
    private setFocusToSelectedOption(): void {
        if (this.value) {
            const allOptions = this.allOptions;
            const selectedIndex = allOptions.findIndex(option => option === this.value);
            if (selectedIndex >= 0) {
                this.focusedIndex = selectedIndex;
            }
        }
    }

    /**
     * Move focus to the next option
     */
    private focusNextOption(): void {
        const allOptions = this.allOptions;
        if (allOptions.length === 0) return;

        if (this.focusedIndex === -1) {
            // No option focused, focus the first option
            this.focusedIndex = 0;
        } else if (this.focusedIndex < allOptions.length - 1) {
            this.focusedIndex++;
        } else {
            // Wrap to first option
            this.focusedIndex = 0;
        }

        // Scroll the focused option into view
        this.scrollFocusedOptionIntoView();
    }

    /**
     * Move focus to the previous option
     */
    private focusPreviousOption(): void {
        const allOptions = this.allOptions;
        if (allOptions.length === 0) return;

        if (this.focusedIndex === -1) {
            // No option focused, focus the last option
            this.focusedIndex = allOptions.length - 1;
        } else if (this.focusedIndex > 0) {
            this.focusedIndex--;
        } else {
            this.focusedIndex = allOptions.length - 1;
        }

        // Scroll the focused option into view
        this.scrollFocusedOptionIntoView();
    }

    /**
     * Scroll the currently focused option into view
     */
    private scrollFocusedOptionIntoView(): void {
        if (this.focusedIndex < 0) return;

        // Use setTimeout to ensure the DOM has been updated
        setTimeout(() => {
            const container = this.elementRef.nativeElement.querySelector('[role="presentation"].overflow-auto');
            if (!container) return;

            const focusedOptionId = `option-${this.focusedIndex}`;
            const focusedElement = document.getElementById(focusedOptionId);
            
            if (!focusedElement) return;

            const containerRect = container.getBoundingClientRect();
            const elementRect = focusedElement.getBoundingClientRect();

            // Calculate relative positions within the container
            const elementTop = elementRect.top - containerRect.top + container.scrollTop;
            const elementBottom = elementTop + elementRect.height;
            const containerScrollTop = container.scrollTop;
            const containerScrollBottom = containerScrollTop + container.clientHeight;

            // Check if element is above the visible area
            if (elementTop < containerScrollTop) {
                container.scrollTop = elementTop;
            }
            // Check if element is below the visible area
            else if (elementBottom > containerScrollBottom) {
                container.scrollTop = elementBottom - container.clientHeight;
            }
        }, 0);
    }

    /**
     * Select the currently focused option
     */
    private selectFocusedOption(): void {
        const allOptions = this.allOptions;
        if (this.focusedIndex >= 0 && this.focusedIndex < allOptions.length) {
            const selectedOption = allOptions[this.focusedIndex];
            this.selectOption(selectedOption);
        }
    }

    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
            this.isOpen = false;
            this.focusedIndex = -1;
        }
    }
    
    // Close dropdown when pressing ESC key
    @HostListener('document:keydown.escape', ['$event'])
    onEscKeydown(event: KeyboardEvent): void {
        if (this.isOpen) {
            this.isOpen = false;
            this.focusedIndex = -1;
            event.preventDefault();
        }
    }

    // Handle arrow down key
    @HostListener('keydown.arrowdown', ['$event'])
    onArrowDown(event: KeyboardEvent): void {
        if (this.isOpen) {
            event.preventDefault();
            this.focusNextOption();
        } else if (!this.isDisabled) {
            // Open dropdown if closed
            event.preventDefault();
            this.toggleDropdown();
        }
    }

    // Handle arrow up key
    @HostListener('keydown.arrowup', ['$event'])
    onArrowUp(event: KeyboardEvent): void {
        if (this.isOpen) {
            event.preventDefault();
            this.focusPreviousOption();
        } else if (!this.isDisabled) {
            // Open dropdown if closed
            event.preventDefault();
            this.toggleDropdown();
        }
    }

    // Handle enter key
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

    // Handle space key
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