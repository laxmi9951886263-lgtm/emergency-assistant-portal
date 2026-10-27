import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneFormatPipe } from '../pipes/phone-format.pipe';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';
import { HighlightDirective } from '../directives/highlight.directive';

/**
 * Angular module (NgModule): groups and re-exports shared building blocks.
 * Any component that imports SharedModule gets NgClass, the pipes and the directive.
 */
@NgModule({
  imports: [CommonModule, PhoneFormatPipe, TimeAgoPipe, HighlightDirective],
  exports: [CommonModule, PhoneFormatPipe, TimeAgoPipe, HighlightDirective]
})
export class SharedModule {}