import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagsComponent),
      multi: true
    }
  ]
})
export class TagsComponent implements ControlValueAccessor {

  @Input()
  allowedTags: string[] = [];

  selectedTags: string[] = [];

  propagateChange = (_: any) => { };

  writeValue(tags: string[]): void {
    this.selectedTags = tags || [];
  }

  registerOnChange(fn: () => {}): void {
    this.propagateChange = fn;
  }

  toggleTag(tag: string) {
    const idx = this.selectedTags.indexOf(tag);
    if (idx === -1) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags.splice(idx, 1);
    }
    this.propagateChange(this.selectedTags);
  }

  isTagSelected(tag: string) {
    return this.selectedTags.indexOf(tag) !== -1;
  }

  registerOnTouched(): void { }

}
