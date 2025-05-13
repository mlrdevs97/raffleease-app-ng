import { Component, signal, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface AddressSuggestion {
  placeId: string;
  formattedAddress: string;
  city: string;
  province: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  currentStep = signal<'user' | 'association'>('user');
  
  // Address suggestion handling
  addressQuery = signal('');
  showAddressSuggestions = signal(false);
  addressSuggestions = signal<AddressSuggestion[]>([]);
  
  // User registration form
  userForm: FormGroup;
  
  // Association registration form
  associationForm: FormGroup;
  
  // Mock address data that would come from Google Places API
  mockAddresses: AddressSuggestion[] = [
    {
      placeId: 'place1',
      formattedAddress: '123 Main St, San Francisco, CA 94105, USA',
      city: 'San Francisco',
      province: 'CA',
      zipCode: '94105',
      latitude: 37.7749,
      longitude: -122.4194
    },
    {
      placeId: 'place2',
      formattedAddress: '456 Market St, San Francisco, CA 94105, USA',
      city: 'San Francisco',
      province: 'CA',
      zipCode: '94105',
      latitude: 37.7899,
      longitude: -122.4014
    },
    {
      placeId: 'place3',
      formattedAddress: '789 Mission St, San Francisco, CA 94103, USA',
      city: 'San Francisco',
      province: 'CA',
      zipCode: '94103',
      latitude: 37.7852,
      longitude: -122.4056
    },
    {
      placeId: 'place4',
      formattedAddress: '1000 Broadway, New York, NY 10001, USA',
      city: 'New York',
      province: 'NY',
      zipCode: '10001',
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      placeId: 'place5',
      formattedAddress: '2000 Peachtree St, Atlanta, GA 30309, USA',
      city: 'Atlanta',
      province: 'GA',
      zipCode: '30309',
      latitude: 33.7490,
      longitude: -84.3880
    }
  ];
  
  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private elementRef: ElementRef
  ) {
    // Initialize user form
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      userName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: this.fb.group({
        prefix: ['', [Validators.pattern(/^\+\d{1,3}$/)]],
        nationalNumber: ['', [Validators.pattern(/^\d{1,14}$/)]]
      }),
      password: ['', [
        Validators.required, 
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,32}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
    
    // Initialize association form with simplified address
    this.associationForm = this.fb.group({
      associationName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      email: ['', [Validators.email]],
      phoneNumber: this.fb.group({
        prefix: ['', [Validators.pattern(/^\+\d{1,3}$/)]],
        nationalNumber: ['', [Validators.pattern(/^\d{1,14}$/)]]
      }),
      addressData: this.fb.group({
        addressInput: ['', [Validators.required]],
        placeId: ['', [Validators.required]],
        latitude: [null, [Validators.required]],
        longitude: [null, [Validators.required]],
        city: ['', [Validators.required]],
        province: ['', [Validators.required]],
        zipCode: [''],
        formattedAddress: ['', [Validators.required]]
      })
    });
  }

  ngOnInit() {
    // Set up initial states
  }

  // Close suggestions when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Check if the click was inside the address input or suggestions
    const addressContainer = this.elementRef.nativeElement.querySelector('#addressContainer');
    if (addressContainer && !addressContainer.contains(event.target)) {
      this.showAddressSuggestions.set(false);
    }
  }

  // Custom validator for password matching
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password === confirmPassword) {
      form.get('confirmPassword')?.setErrors(null);
      return null;
    } else {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { passwordMismatch: true };
    }
  }
  
  // Navigate to next step
  nextStep(): void {
    if (this.userForm.valid) {
      this.currentStep.set('association');
    } else {
      this.userForm.markAllAsTouched();
    }
  }
  
  // Go back to user information step
  previousStep(): void {
    this.currentStep.set('user');
  }

  // Handle address search input
  onAddressInputChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.addressQuery.set(query);
    
    if (query.length >= 2) {
      // Filter mock addresses based on query
      const filteredAddresses = this.mockAddresses.filter(
        address => address.formattedAddress.toLowerCase().includes(query)
      );
      
      this.addressSuggestions.set(filteredAddresses);
      this.showAddressSuggestions.set(true); // Always show if we have a query of 2+ chars
    } else {
      this.showAddressSuggestions.set(false);
      this.addressSuggestions.set([]);
    }
  }
  
  // Focus the address input field
  focusAddressInput(event: Event) {
    const query = this.addressQuery();
    if (query.length >= 2) {
      // Re-show suggestions if there's already a valid query
      const filteredAddresses = this.mockAddresses.filter(
        address => address.formattedAddress.toLowerCase().includes(query)
      );
      this.addressSuggestions.set(filteredAddresses);
      this.showAddressSuggestions.set(filteredAddresses.length > 0);
    }
  }
  
  // Handle selection of an address suggestion
  selectAddress(address: AddressSuggestion): void {
    const addressData = this.associationForm.get('addressData');
    if (addressData) {
      addressData.patchValue({
        addressInput: address.formattedAddress,
        placeId: address.placeId,
        latitude: address.latitude,
        longitude: address.longitude,
        city: address.city,
        province: address.province,
        zipCode: address.zipCode,
        formattedAddress: address.formattedAddress
      });
    }
    this.showAddressSuggestions.set(false);
  }

  onSubmit(): void {
    if (!this.userForm.valid || !this.associationForm.valid) {
      this.userForm.markAllAsTouched();
      this.associationForm.markAllAsTouched();
      return;
    }
    
    const registerData = {
      userData: this.userForm.value,
      associationData: this.associationForm.value
    };
    
    // Clean up empty phone number if not provided
    if (!registerData.userData.phoneNumber.prefix && !registerData.userData.phoneNumber.nationalNumber) {
      registerData.userData.phoneNumber = undefined;
    }
    
    if (!registerData.associationData.phoneNumber.prefix && !registerData.associationData.phoneNumber.nationalNumber) {
      registerData.associationData.phoneNumber = undefined;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.authService.register(registerData)
      .catch(error => {
        this.errorMessage.set(error.message || 'Registration failed. Please try again.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
} 