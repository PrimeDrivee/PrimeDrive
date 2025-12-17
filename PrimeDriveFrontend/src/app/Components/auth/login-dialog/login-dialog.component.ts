import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../Services/auth/auth.service';
import { FormsModule } from '@angular/forms';

/**
 * Component for rendering a login dialog with username and password inputs.
 * Utilizes Angular Material for styling and layout.
 *
 * When submitted, credentials are sent to the AuthService for authentication.
 * On success, the dialog is closed and emits a success flag.
 *
 * Author: Fatlum Epiroti
 * Version: 1.0.0
 * Date: 2025-06-03
 */
@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent {
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<LoginDialogComponent>);

  /** If false, keeps the dialog open after a successful login (handy for tests). */
  @Input() closeOnSuccess = true;
  /** Emits when login succeeds. */
  @Output() loginSucceeded = new EventEmitter<void>();

  /** Holds the input username from the user. */
  username = '';
  /** Holds the input password from the user. */
  password = '';

  /**
   * Handles user login action.
   * Sends username and password to the AuthService and closes the dialog on success.
   * Logs errors to the console on failure.
   */
  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.loginSucceeded.emit();
        if (this.closeOnSuccess) {
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        console.error('Login failed', error);
      },
    });
  }
}
