import { Directive, ElementRef, HostListener, inject, AfterViewInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { formatName } from '../../core/utils/text-format.utils';

@Directive({
  selector: '[appNameFormatter]',
  standalone: true
})
export class NameFormatterDirective implements AfterViewInit {
  private readonly elementRef = inject(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  ngAfterViewInit(): void {
    // Format initial value if it exists
    this.formatCurrentValue();
    
    // Subscribe to form control value changes to handle programmatic updates
    if (this.ngControl?.control) {
      this.ngControl.control.valueChanges.subscribe(() => {
        setTimeout(() => this.formatCurrentValue(), 0);
      });
    }
  }

  /**
   * Formats the current value in the input field
   */
  private formatCurrentValue(): void {
    const element = this.elementRef.nativeElement as HTMLInputElement;
    const currentValue = element.value;
    const formattedValue = formatName(currentValue);
    
    if (formattedValue !== currentValue) {
      element.value = formattedValue;
      
      // Update the form control value if available
      if (this.ngControl?.control) {
        this.ngControl.control.setValue(formattedValue, { emitEvent: false });
      }
    }
  }

  @HostListener('blur')
  onBlur(): void {
    this.formatCurrentValue();
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const currentValue = element.value;
    
    // Format when user finishes typing a word (after space) or when they pause typing
    if (currentValue.endsWith(' ') || currentValue.split(' ').length > 1) {
      const formattedValue = formatName(currentValue);
      
      if (formattedValue !== currentValue) {
        element.value = formattedValue;
        
        // Update the form control value if available
        if (this.ngControl?.control) {
          this.ngControl.control.setValue(formattedValue, { emitEvent: false });
        }
        
        // Set cursor position to end
        setTimeout(() => {
          element.setSelectionRange(element.value.length, element.value.length);
        }, 0);
      }
    }
  }
} 