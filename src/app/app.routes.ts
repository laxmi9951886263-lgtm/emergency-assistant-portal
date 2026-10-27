import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Home | Emergency Assistant Portal' },
  {
    path: 'contacts',
    title: 'Emergency Contacts',
    loadComponent: () =>
      import('./components/emergency-contacts/emergency-contacts.component').then(
        (m) => m.EmergencyContactsComponent
      )
  },
  {
    path: 'request',
    title: 'Request Help',
    loadComponent: () =>
      import('./components/emergency-request/emergency-request.component').then(
        (m) => m.EmergencyRequestComponent
      )
  },
  {
    path: 'first-aid',
    title: 'First Aid Guides',
    loadComponent: () =>
      import('./components/first-aid/first-aid.component').then((m) => m.FirstAidComponent)
  },
  { path: '**', redirectTo: '' }
];
