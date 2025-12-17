import { Component, ViewChild, AfterViewChecked } from '@angular/core';
import { inject } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../Services/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Component for the registration dialog.
 * Collects user data and sends it to the AuthService for registration.
 *
 * Author: Fatlum Epiroti
 * Version: 1.0.0
 * Date: 2025-06-03
 */
@Component({
  selector: 'app-register-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    MatError,
  ],
  templateUrl: './register-dialog.component.html',
  styleUrl: './register-dialog.component.scss',
})
export class RegisterDialogComponent implements AfterViewChecked {
  @ViewChild('passwordModel') passwordModel!: NgModel;
  @ViewChild('confirmPasswordModel') confirmPasswordModel!: NgModel;
  @ViewChild('zipCodeModel') zipCodeModel!: NgModel;
  @ViewChild('phoneNumberModel') phoneNumberModel!: NgModel;
  /** @public Username for registration */
  public username = '';
  /** @public Password for registration */
  public password = '';
  /** @public Confirmation of the password */
  public confirmPassword = '';
  /** @public First name of the user */
  public firstName = '';
  /** @public Last name of the user */
  public lastName = '';
  /** @public Email address of the user */
  public email = '';
  /** @public Birthdate of the user */
  public birthdate = '';
  /** @public Address of the user */
  public address = '';
  /** @public Zip code of the user's address */
  public zipCode = '';
  /** @public City of the user's address */
  public city = '';
  /** @public Country of the user's address */
  public country = '';
  /** @public Phone number of the user */
  public phoneNumber = '';

  private authService = inject(AuthService);

  /** Converts yyyy-MM-dd to dd.MM.yyyy */
  private convertToAppFormat(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  }

  /** @public Registers the user with the provided data */
  public register() {
    const registerDto = {
      username: this.username,
      password: this.password,
      confirmPassword: this.confirmPassword,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      birthdate: this.convertToAppFormat(this.birthdate),
      address: this.address,
      zipCode: this.zipCode,
      city: this.city,
      country: this.country,
      phoneNumber: this.phoneNumber,
    };

    this.authService.register(registerDto).subscribe({
      error: (err: HttpErrorResponse) => {
        if (err.error instanceof ErrorEvent) {
          console.error('Client-side error during registration:', err.error.message);
        } else {
          console.error(`Server returned code ${err.status}, body was:`, err.error);
        }
      },
    });
  }

  ngAfterViewChecked(): void {
    if (
      this.confirmPasswordModel &&
      this.passwordModel &&
      this.confirmPasswordModel.valid &&
      this.password !== this.confirmPassword
    ) {
      this.confirmPasswordModel.control.setErrors({ mismatch: true });
    } else if (this.confirmPasswordModel?.errors?.['mismatch']) {
      this.confirmPasswordModel.control.setErrors(null);
      this.confirmPasswordModel.control.updateValueAndValidity({
        onlySelf: true,
      });
    }

    // Manual validation for zip code
    if (this.zipCodeModel && this.zipCodeModel.valid && !/^\d{4}$/.test(this.zipCode)) {
      this.zipCodeModel.control.setErrors({ invalidZip: true });
    } else if (this.zipCodeModel?.errors?.['invalidZip']) {
      this.zipCodeModel.control.setErrors(null);
      this.zipCodeModel.control.updateValueAndValidity({ onlySelf: true });
    }

    // Manual validation for phone number: must start with 0, exactly 10 digits, e.g. 0781234567, no letters
    if (
      this.phoneNumberModel &&
      this.phoneNumberModel.valid &&
      !/^0\d{9}$/.test(this.phoneNumber)
    ) {
      this.phoneNumberModel.control.setErrors({ invalidPhone: true });
    } else if (this.phoneNumberModel?.errors?.['invalidPhone']) {
      this.phoneNumberModel.control.setErrors(null);
      this.phoneNumberModel.control.updateValueAndValidity({ onlySelf: true });
    }
  }
}
