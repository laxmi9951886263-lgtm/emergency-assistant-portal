import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  takeUntil
} from 'rxjs';
import { EmergencyService } from '../../services/emergency.service';
import { FirstAidGuide, sortBy } from '../../models/emergency.model';
import { GuideCardComponent } from './guide-card.component';

@Component({
  selector: 'app-first-aid',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, GuideCardComponent],
  templateUrl: './first-aid.component.html'
})
export class FirstAidComponent implements OnInit, OnDestroy {
  private readonly emergencyService = inject(EmergencyService);
  private readonly destroy$ = new Subject<void>();

  readonly search = new FormControl('', { nonNullable: true });
  guides$!: Observable<FirstAidGuide[]>;
  selectedId: number | null = null;
  error = '';

  ngOnInit(): void {
    const all$ = this.emergencyService.getFirstAidGuides().pipe(
      catchError(() => {
        this.error = 'Guides could not be loaded. Check your connection and try again.';
        return of<FirstAidGuide[]>([]);
      })
    );

    const term$ = this.search.valueChanges.pipe(
      debounceTime(150),
      startWith(this.search.value),
      distinctUntilChanged()
    );

    this.guides$ = combineLatest([all$, term$]).pipe(
      map(([guides, term]) => {
        const text = term.trim().toLowerCase();
        const matches = guides.filter(
          (g) => !text || g.title.toLowerCase().includes(text) || g.summary.toLowerCase().includes(text)
        );
        return sortBy(matches, 'title');
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(id: number): void {
    this.selectedId = this.selectedId === id ? null : id;
  }
}