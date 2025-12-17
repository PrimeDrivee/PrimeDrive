import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../auth/login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../auth/register-dialog/register-dialog.component';
import { AuthService } from '../../Services/auth/auth.service';
import { UsersService } from '../../Services/users/users.service';
import { User } from '../../Models/vehicles/user.interface';
import { RouterModule } from '@angular/router';

/**
 * NavigationComponent handles the application's top navigation bar.
 * Provides login, logout, and registration dialogs.
 * Also checks and reflects the authentication and admin status of the user.
 *
 * Author: Fatlum Epiroti
 * Version: 1.0.0
 * Date: 2025-06-03
 */
@Component({
  selector: 'app-navigation',
  imports: [LoginDialogComponent, RegisterDialogComponent, RouterModule],
  standalone: true,
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent implements OnInit {
  /** Indicates if the user is currently logged in. */
  protected isLoggedIn = false;
  /** Indicates if the current user has admin privileges. */
  protected isAdmin = false;
  /** Controls whether logout triggers a full page reload. Useful to disable in tests. */
  @Input() reloadOnLogout = true;
  /** Emits the authentication state whenever it changes. */
  @Output() loginStateChanged = new EventEmitter<boolean>();
  /** Emits when logout completes; payload indicates success. */
  @Output() logoutCompleted = new EventEmitter<boolean>();
  /** Reload function to allow test overrides. */
  private reloadFn: () => void = () => window.location.reload();
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private readonly usersService: UsersService = inject(UsersService);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Lifecycle hook that runs on component initialization. Checks login status. */
  public ngOnInit(): void {
    this.checkLoginStatus();
  }

  /** Opens the login dialog and checks login status after it's closed. */
  public openLoginDialog() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '400px',
      data: { message: 'Hello from NavigationComponent!' },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        this.checkLoginStatus();
      }
    });
  }

  /** Opens the registration dialog. */
  public openRegisterDialog() {
    this.dialog.open(RegisterDialogComponent, {
      width: '400px',
      data: { message: 'Hello from NavigationComponent!' },
    });
  }

  /** Logs the user out and updates the local login state. */
  public logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggedIn = false;
        this.logoutCompleted.emit(true);
        this.cdr.markForCheck();
        if (this.reloadOnLogout) {
          this.reloadFn();
        }
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.logoutCompleted.emit(false);
      },
    });
  }

  /** Checks the current authentication state and updates admin status if logged in. */
  private checkLoginStatus(): void {
    this.authService.isAuthenticated().subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      this.loginStateChanged.emit(loggedIn);
      if (loggedIn) {
        this.usersService.getCurrentUser().subscribe((user: User) => {
          this.isAdmin = user.role === 'ADMIN';
          this.cdr.markForCheck();
        });
      }
      this.cdr.markForCheck();
    });
  }
}
