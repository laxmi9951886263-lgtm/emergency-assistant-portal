import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FirstAidGuide } from '../../models/emergency.model';

/** Child component: data comes in with @Input, events go out with @Output. */
@Component({
  selector: 'app-guide-card',
  standalone: true,
  imports: [SharedModule, RouterLink],
  templateUrl: './guide-card.component.html'
})
export class GuideCardComponent implements OnChanges {
  @Input({ required: true }) guide!: FirstAidGuide;
  @Input() expanded = false;
  @Output() toggled = new EventEmitter<number>();

  stepCount = 0;

  // Lifecycle hook: runs whenever an @Input value changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['guide']) {
      this.stepCount = this.guide.steps.length;
    }
  }
}