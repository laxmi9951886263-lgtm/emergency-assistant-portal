import { Component } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HighlightDirective } from '../../directives/highlight.directive';
import { EmergencyType } from '../../models/emergency.model';

interface QuickAction {
  type: EmergencyType;
  icon: string;
  text: string;
}

interface HelplineNumber {
  service: string;
  number: string;
  note: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, UpperCasePipe, HighlightDirective],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  readonly quickActions: QuickAction[] = [
    { type: EmergencyType.Medical, icon: '🩺', text: 'Chest pain, breathing trouble, serious injury.' },
    { type: EmergencyType.Fire, icon: '🔥', text: 'Fire or smoke in a building or vehicle.' },
    { type: EmergencyType.Police, icon: '🚓', text: 'Crime, threat or personal safety concern.' },
    { type: EmergencyType.Accident, icon: '🚗', text: 'Road or workplace accident with injuries.' },
    { type: EmergencyType.Disaster, icon: '🌊', text: 'Flood, storm, earthquake or building collapse.' }
  ];

  readonly helplines: HelplineNumber[] = [
    { service: 'National emergency', number: '112', note: 'Any emergency' },
    { service: 'Police', number: '100', note: '24x7' },
    { service: 'Fire', number: '101', note: '24x7' },
    { service: 'Ambulance', number: '102 / 108', note: '24x7' }
  ];
}
