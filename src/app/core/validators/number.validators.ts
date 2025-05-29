import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

/**
 * Validator to ensure a number is positive (greater than 0)
 */
export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Skip validation if value is empty
    }
    
    const numValue = Number(value);
    return !isNaN(numValue) && numValue > 0 ? null : { 'positive': true };
  };
}

/**
 * Validator to ensure a number is non-negative (greater than or equal to 0)
 */
export function nonNegativeNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Skip validation if value is empty
    }
    
    const numValue = Number(value);
    return !isNaN(numValue) && numValue >= 0 ? null : { 'nonNegative': true };
  };
}

/**
 * Validator to ensure minimum value is not greater than maximum value
 */
export function minMaxValidator(minControlName: string, maxControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const minValue = formGroup.get(minControlName)?.value;
    const maxValue = formGroup.get(maxControlName)?.value;
    
    if (!minValue || !maxValue) {
      return null; // Skip validation if either value is empty
    }
    
    const min = Number(minValue);
    const max = Number(maxValue);
    
    if (isNaN(min) || isNaN(max)) {
      return null; // Skip validation if either value is not a number
    }
    
    return min <= max ? null : { 'minGreaterThanMax': true };
  };
} 