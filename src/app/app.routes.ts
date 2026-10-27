import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

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
    canDeactivate: [unsavedChangesGuard],
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
  {
    path: 'first-aid/:id',
    title: 'First Aid Guide',
    loadComponent: () =>
      import('./components/first-aid/guide-detail.component').then((m) => m.GuideDetailComponent)
  },
  { path: '**', redirectTo: '' }
];