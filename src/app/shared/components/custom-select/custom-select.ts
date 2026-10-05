import { Component, ElementRef, computed, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: number;
  label: string;
  hint?: string;
}

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.html',
  styleUrl: './custom-select.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomSelect), multi: true },
  ],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class CustomSelect implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input('Select');

  protected readonly value = signal<number | null>(null);
  protected readonly isOpen = signal(false);
  protected readonly isDisabled = signal(false);

  protected readonly selectedLabel = computed(
    () => this.options().find((o) => o.value === this.value())?.label ?? null,
  );

  private onChange: (v: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: number | null): void {
    this.value.set(v ?? null);
  }
  registerOnChange(fn: (v: number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  protected toggle() {
    if (this.isOpen()) this.close();
    else this.isOpen.set(true);
  }

  protected close() {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.onTouched();
  }

  protected select(v: number | null) {
    this.value.set(v);
    this.onChange(v);
    this.close();
  }

  protected onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }
}
