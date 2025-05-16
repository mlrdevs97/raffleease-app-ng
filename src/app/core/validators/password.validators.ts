import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validator that checks if password and confirm password fields match
 * @returns ValidatorFn that checks for password match
 */
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password === confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    } else {
      formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
      return { passwordMismatch: true };
    }
  };
} 