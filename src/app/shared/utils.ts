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
