import { Pipe, PipeTransform } from '@angular/core';
import { EmergencyUtils } from '../models/emergency.model';

/** Custom pipe: {{ '9876543210' | phoneFormat }} -> +91 98765 43210 */
@Pipe({ name: 'phoneFormat', standalone: true })
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | null | undefined, countryCode = '+91'): string {
    return value ? EmergencyUtils.formatPhone(value, countryCode) : '—';
  }
}
