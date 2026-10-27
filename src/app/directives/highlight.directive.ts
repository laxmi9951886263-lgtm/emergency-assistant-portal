import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

/** Custom attribute directive: <tr [appHighlight]="'#e8f4ff'"> highlights the element on hover. */
@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {
  @Input('appHighlight') color = '';

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('mouseenter')
  onEnter(): void {
    this.el.nativeElement.style.backgroundColor = this.color || '#fff3cd';
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.el.nativeElement.style.backgroundColor = '';
  }
}
