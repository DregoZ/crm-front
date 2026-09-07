import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { ButtonComponent } from '../button/button.component';
import { catchError, finalize, of } from 'rxjs';
import { FormFieldConfig, FormModalData } from '../../form-fields.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatButtonModule,
    ButtonComponent,
    MatIconModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './modal-form.component.html',
  styleUrl: './modal-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalFormComponent {
  private dialogRef = inject(MatDialogRef<ModalFormComponent>);
  data = inject<FormModalData>(MAT_DIALOG_DATA);

  saving = signal(false);
  errorMessage = signal<string | null>(null);

  form = new FormGroup(
    Object.fromEntries(
      this.data.fields.map((field: any) => {
        const validators = [];
        if (field.required) validators.push(Validators.required);
        if (field.type === 'text') {
          validators.push(Validators.maxLength(field.maxLength ?? 128));
        } else if (field.type === 'textarea' && field.maxLength) {
          validators.push(Validators.maxLength(field.maxLength));
        }
        if (field.extraValidators) validators.push(...field.extraValidators);

        let initialValue = field.value;
        if (
          field.type === 'date' &&
          field.value &&
          !(field.value instanceof Date)
        ) {
          const parsed = new Date(field.value);
          if (!isNaN(parsed.getTime())) {
            initialValue = parsed;
          }
        }

        const control = new FormControl(
          { value: initialValue, disabled: field.editable === false },
          validators,
        );
        return [field.id, control];
      }),
    ),
  );

  get fields(): FormFieldConfig[] {
    return this.data.fields;
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    this.data
      .onSave(this.form.getRawValue()) // getRawValue incluye también los campos disabled
      .pipe(
        catchError((err) => {
          this.errorMessage.set(
            err?.error?.error || 'No se pudo guardar. Inténtalo de nuevo.',
          );
          return of(null);
        }),
        finalize(() => this.saving.set(false)),
      )
      .subscribe((result: any) => {
        if (result !== null) this.dialogRef.close(result);
      });
  }
}
