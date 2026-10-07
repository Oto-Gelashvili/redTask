import { AbstractControl } from '@angular/forms';

export function applyServerErrors(form: AbstractControl, errors: Record<string, string[]> = {}) {
  for (const [field, messages] of Object.entries(errors)) {
    const control = form.get(field);
    if (control) {
      control.setErrors({ server: messages[0] });
      control.markAsTouched();
    }
  }
}
export function toLocalISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
