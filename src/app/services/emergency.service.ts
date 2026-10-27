import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import {
  EmergencyContact,
  EmergencyRequest,
  FirstAidGuide,
  LocalStore,
  NewEmergencyRequest
} from '../models/emergency.model';

/**
 * Topics: Services, Dependency Injection, HTTP Client, AJAX (XMLHttpRequest),
 * XML namespaces + XML parser (DOMParser), JSON handling, Promises.
 */
@Injectable({ providedIn: 'root' })
export class EmergencyService {
  private readonly apiUrl = 'http://localhost:3000/api/requests'; // Node.js + Express API (npm run api)
  private readonly fallbackStore = new LocalStore<EmergencyRequest>('eap-requests');
  private readonly contactsNamespace = 'http://emergency-portal.example/contacts';

  // Dependency Injection: Angular supplies HttpClient through the constructor.
  constructor(private readonly http: HttpClient) {}

  // ---------------------------------------------------------------------
  // AJAX with XMLHttpRequest + XML parsing
  // ---------------------------------------------------------------------
  loadContactsXml(): Promise<EmergencyContact[]> {
    return new Promise<EmergencyContact[]>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'assets/data/emergency-contacts.xml', true); // true = asynchronous
      xhr.timeout = 8000;

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          return; // 0 UNSENT, 1 OPENED, 2 HEADERS_RECEIVED, 3 LOADING, 4 DONE
        }
        if (xhr.status === 200) {
          try {
            resolve(this.parseContacts(xhr.responseText));
          } catch (error) {
            reject(error);
          }
        } else if (xhr.status !== 0) {
          reject(new Error(`Could not load contacts (HTTP ${xhr.status}).`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error while loading contacts.'));
      xhr.ontimeout = () => reject(new Error('Loading contacts timed out.'));
      xhr.send();
    });
  }

  /** XML parser + namespace-aware DOM queries. */
  private parseContacts(xmlText: string): EmergencyContact[] {
    const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('The contacts XML file is not well-formed.');
    }

    const ns = this.contactsNamespace;
    const read = (parent: Element, tag: string): string =>
      parent.getElementsByTagNameNS(ns, tag)[0]?.textContent?.trim() ?? '';

    return Array.from(doc.getElementsByTagNameNS(ns, 'contact')).map((node) => ({
      id: node.getAttribute('id') ?? '',
      category: node.getAttribute('category') ?? 'Helpline',
      name: read(node, 'name'),
      phone: read(node, 'phone'),
      available: read(node, 'available')
    }));
  }

  // ---------------------------------------------------------------------
  // Angular HttpClient (returns Observables, JSON is parsed automatically)
  // ---------------------------------------------------------------------
  getFirstAidGuides(): Observable<FirstAidGuide[]> {
    return this.http.get<FirstAidGuide[]>('assets/data/first-aid.json');
  }

  getRequests(): Observable<EmergencyRequest[]> {
    return this.http.get<EmergencyRequest[]>(this.apiUrl).pipe(
      catchError(() => of(this.fallbackStore.getAll())) // API offline -> local copy
    );
  }

  submitRequest(payload: NewEmergencyRequest): Observable<EmergencyRequest> {
    const body: EmergencyRequest = {
      ...payload,
      createdAt: new Date().toISOString(),
      status: 'Pending'
    };
    return this.http.post<EmergencyRequest>(this.apiUrl, body).pipe(
      catchError(() => of(this.fallbackStore.add(body))) // API offline -> save locally
    );
  }
}
