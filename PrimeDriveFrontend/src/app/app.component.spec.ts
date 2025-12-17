import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './Services/auth/auth.service';
import { UsersService } from './Services/users/users.service';
import { MatDialog } from '@angular/material/dialog';

describe('AppComponent (standalone)', () => {
  beforeEach(async () => {
    const authMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'isAuthenticated',
      'logout',
    ]);
    authMock.isAuthenticated.and.returnValue(of(false));
    authMock.logout.and.returnValue(of(void 0));

    const usersMock = jasmine.createSpyObj<UsersService>('UsersService', [
      'getCurrentUser',
    ]);
    usersMock.getCurrentUser.and.returnValue(of());

    const dialogMock = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: UsersService, useValue: usersMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();
  });

  it('should create the app component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('has the correct title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toBe('Prime Drive');
  });
});
