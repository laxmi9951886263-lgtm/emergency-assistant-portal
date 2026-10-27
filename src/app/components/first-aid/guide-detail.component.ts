import { Component, Input, OnChanges, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { EmergencyService } from '../../services/emergency.service';
import { FirstAidGuide, findById } from '../../models/emergency.model';

interface GuideView {
  guide?: FirstAidGuide;
}

/** Route parameter page: /first-aid/:id (the :id is bound to the `id` input by withComponentInputBinding). */
@Component({
  selector: 'app-guide-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './guide-detail.component.html'
})
export class GuideDetailComponent implements OnChanges {
  @Input() id = '';

  private readonly emergencyService = inject(EmergencyService);
  view$!: Observable<GuideView>;

  ngOnChanges(): void {
    this.view$ = this.emergencyService.getFirstAidGuides().pipe(
      map((list) => ({ guide: findById(list, Number(this.id)) })),
      catchError(() => of<GuideView>({}))
    );
  }
}