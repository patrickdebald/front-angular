import { Component } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

export const StrongPasswordRegx: RegExp =
  /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d)(?=.*[@$!%*?&]).{8,}$/;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent,
    CommonModule
  ],
  providers: [
    LoginService
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  signupForm: FormGroup;
  passwordRequirements = {
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private toastService: ToastrService
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordStrengthValidator.bind(this)]],
      passwordConfirm: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.signupForm.get('passwordConfirm')?.valueChanges.subscribe(() => {
      this.signupForm.updateValueAndValidity({ onlySelf: true });
    });
  }

  // ✅ Validador personalizado para verificar se as senhas coincidem
  passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const passwordConfirm = formGroup.get('passwordConfirm')?.value;
    return password === passwordConfirm ? null : { mismatch: true };
  }

  // ✅ Validador personalizado para verificar força da senha
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    
    this.passwordRequirements = {
      minLength: value.length >= 8,
      hasUpper: /[A-Z]/.test(value),
      hasLower: /[a-z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSpecial: /[@$!%*?&]/.test(value)
    };

    return Object.values(this.passwordRequirements).every(req => req) ? null : { weakPassword: true };
  }

  submit() {
    if (this.signupForm.invalid) {
      this.toastService.error("Preencha todos os campos corretamente!");
      return;
    }

    const { name, email, password } = this.signupForm.value;

    this.loginService.signup(name, email, password).subscribe({
      next: () => this.toastService.success("Cadastro realizado com sucesso!"),
      error: () => this.toastService.error("Erro inesperado! Tente novamente mais tarde")
    });
  }

  navigate() {
    this.router.navigate(['login']);
  }
}
