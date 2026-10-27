import { Component, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { EmergencyService } from '../../services/emergency.service';
import { EmergencyContact } from '../../models/emergency.model';
import { PhoneFormatPipe } from '../../pipes/phone-format.pipe';
import { HighlightDirective } from '../../directives/highlight.directive';

interface PersonalContact {
  name: string;
  phone: string;
}

/**
 * Topics: lifecycle hook (ngOnInit), async/await, template-driven forms + validation,
 * two-way binding, *ngFor-style loops (@for), pipes, directives.
 */
@Component({
  selector: 'app-emergency-contacts',
  standalone: true,
  imports: [FormsModule, NgClass, PhoneFormatPipe, HighlightDirective],
  templateUrl: './emergency-contacts.component.html'
})
export class EmergencyContactsComponent implements OnInit {
  private readonly emergencyService = inject(EmergencyService);
  private readonly storageKey = 'eap-personal-contacts';

  contacts: EmergencyContact[] = [];
  filtered: EmergencyContact[] = [];
  categories: string[] = [];
  searchTerm = '';
  category = '';
  loading = true;
  error = '';

  personal: PersonalContact = { name: '', phone: '' };
  personalContacts: PersonalContact[] = [];

  async ngOnInit(): Promise<void> {
    this.personalContacts = this.readPersonal();
    try {
      this.contacts = await this.emergencyService.loadContactsXml(); // AJAX + XML
      this.categories = [...new Set(this.contacts.map((c) => c.category))].sort();
      this.applyFilter();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Could not load contacts.';
    } finally {
      this.loading = false;
    }
  }

  setSearch(value: string): void {
    this.searchTerm = value;
    this.applyFilter();
  }

  setCategory(value: string): void {
    this.category = value;
    this.applyFilter();
  }

  private applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filtered = this.contacts.filter(
      (c) =>
        (!this.category || c.category === this.category) &&
        (!term || c.name.toLowerCase().includes(term) || c.phone.includes(term))
    );
  }

  addPersonal(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.personalContacts = [...this.personalContacts, { name: this.personal.name.trim(), phone: this.personal.phone }];
    this.savePersonal();
    form.resetForm({ pname: '', pphone: '' });
  }

  removePersonal(index: number): void {
    this.personalContacts = this.personalContacts.filter((_, i) => i !== index);
    this.savePersonal();
  }

  private readPersonal(): PersonalContact[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) ?? '[]') as PersonalContact[];
    } catch {
      return [];
    }
  }

  private savePersonal(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.personalContacts));
    } catch {
      /* storage unavailable; contacts stay in memory only */
    }
  }
}
