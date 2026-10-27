import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EmergencyService } from '../../services/emergency.service';
import { LocationService } from '../../services/location.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';
import {
  EmergencyRequest,
  EmergencyType,
  GeoPoint,
  Report,
  Severity,
  createReport
} from '../../models/emergency.model';

/** Custom validator: the description must contain at least `minWords` words. */
function minWords(count: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const words = String(control.value ?? '').trim().split(/\s+/).filter(Boolean);
    return words.length >= count ? null : { minWords: { required: count, actual: words.length } };
  };
}

/**
 * Topics: Reactive forms, validation (built-in + custom), lifecycle hooks (ngOnInit/ngOnDestroy),
 * routing (query params), services, async/await, subscriptions.
 */
@Component({
  selector: 'app-emergency-request',
  standalone: true,
  imports: [ReactiveFormsModule, TimeAgoPipe],
  templateUrl: './emergency-request.component.html'
})
export class EmergencyRequestComponent implements OnInit, OnDestroy, HasUnsavedChanges {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly emergencyService = inject(EmergencyService);
  private readonly locationService = inject(LocationService);
  private readonly destroy$ = new Subject<void>();

  readonly types = Object.values(EmergencyType);
  readonly severities = Object.values(Severity);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    type: this.fb.nonNullable.control<EmergencyType>(EmergencyType.Medical, Validators.required),
    severity: this.fb.nonNullable.control<Severity>(Severity.High, Validators.required),
    address: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.maxLength(300), minWords(3)]],
    consent: [false, Validators.requiredTrue]
  });

  location: GeoPoint | null = null;
  locating = false;
  locationMessage = '';
  submitting = false;
  submitError = '';
  report: Report | null = null;
  history: EmergencyRequest[] = [];

  // ---------- Lifecycle hooks ----------
  ngOnInit(): void {
    // Read ?type=Fire from the URL (set by the cards on the home page)
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const type = params.get('type') as EmergencyType | null;
      if (type && this.types.includes(type)) {
        this.form.patchValue({ type });
      }
    });
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Used by the route guard to warn before leaving a half-filled form. */
  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.submitting;
  }

  // ---------- Helpers used by the template ----------
  showError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  errorMessage(controlName: string): string {
    const errors = this.form.get(controlName)?.errors;
    if (!errors) {
      return '';
    }
    if (errors['required'] || errors['requiredTrue']) {
      return controlName === 'consent' ? 'Please confirm to continue.' : 'This field is required.';
    }
    if (errors['minlength']) {
      return `Enter at least ${errors['minlength'].requiredLength} characters.`;
    }
    if (errors['maxlength']) {
      return `Keep it under ${errors['maxlength'].requiredLength} characters.`;
    }
    if (errors['pattern']) {
      return 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.';
    }
    if (errors['minWords']) {
      return `Describe the situation in at least ${errors['minWords'].required} words.`;
    }
    return 'Please check this field.';
  }

  get descriptionLength(): number {
    return this.form.controls.description.value.length;
  }

  // ---------- Actions ----------
  async useMyLocation(): Promise<void> {
    this.locating = true;
    this.locationMessage = '';
    try {
      this.location = await this.locationService.locateWithAddress();
      this.form.patchValue({ address: this.location.address ?? '' });
      this.locationMessage = 'Location added.';
    } catch (err) {
      this.locationMessage = err instanceof Error ? err.message : 'Could not get your location.';
    } finally {
      this.locating = false;
    }
  }

  submit(): void {
    this.submitError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.submitting = true;
    this.emergencyService
      .submitRequest({
        name: v.name.trim(),
        phone: v.phone,
        type: v.type,
        severity: v.severity,
        address: v.address.trim(),
        description: v.description.trim(),
        location: this.location ?? undefined
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (saved) => {
          this.report = createReport(saved);
          this.submitting = false;
          this.form.reset();
          this.location = null;
          this.locationMessage = '';
          this.loadHistory();
        },
        error: () => {
          this.submitting = false;
          this.submitError = 'Your request could not be sent. Call 112 now.';
        }
      });
  }

  private loadHistory(): void {
    this.emergencyService
      .getRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.history = [...list].reverse().slice(0, 5); // newest first, last 5
      });
  }
}