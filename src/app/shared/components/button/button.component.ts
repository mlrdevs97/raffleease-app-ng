import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'gray';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html'
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() loadingText = 'Loading...';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;
  @Input() customClasses = '';

  @Output() clicked = new EventEmitter<Event>();

  // Base classes that are common to all buttons
  private readonly baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-semibold';

  // Variant-specific classes
  private readonly variantClasses = {
    primary: 'bg-zinc-900 text-white hover:bg-slate-800',
    secondary: 'border border-zinc-200 bg-white text-zinc-950 hover:bg-slate-100',
    gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  };

  // Size-specific classes
  private readonly sizeClasses = {
    sm: 'h-9 px-3 py-2 text-sm',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-11 px-8 py-2 text-base'
  };

  // Computed properties for template use
  isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  buttonClasses(): string {
    const classes = [
      this.baseClasses,
      this.variantClasses[this.variant],
      this.sizeClasses[this.size]
    ];

    if (this.fullWidth) {
      classes.push('w-full');
    }

    if (this.customClasses) {
      classes.push(this.customClasses);
    }

    return classes.join(' ');
  }

  onClick(event: Event): void {
    if (!this.isDisabled()) {
      this.clicked.emit(event);
    }
  }
} 