import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Valida en el formulario que la confirmación coincida con la contraseña
export function contrasenasIguales(campo: string, confirmacion: string): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const control = form.get(confirmacion);
    if (!control || !control.value) return null;
    const iguales = form.get(campo)?.value === control.value;
    control.setErrors(iguales ? null : { distintas: true });
    return null;
  };
}
