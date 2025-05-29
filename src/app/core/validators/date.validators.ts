import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

/**
 * Validator to ensure the 'from' date is not after the 'to' date
 * 
 * @param fromControlName The name of the control containing the start date
 * @param toControlName The name of the control containing the end date
 * @returns A validator function that checks if the start date is not after the end date
 */
export function dateRangeValidator(fromControlName: string, toControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const fromDate = formGroup.get(fromControlName)?.value;
    const toDate = formGroup.get(toControlName)?.value;
    
    if (!fromDate || !toDate) {
      return null; // Skip validation if either date is not set
    }
    
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    
    if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
      return null; // Skip validation if either date is invalid
    }
    
    return fromDateObj <= toDateObj ? null : { 
      'dateRange': { 
        from: fromControlName, 
        to: toControlName 
      } 
    };
  };
} 