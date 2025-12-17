import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { of, delay, throwError } from 'rxjs';
import { LoginDialogComponent } from './login-dialog.component';
import { AuthService } from '../../../Services/auth/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { LoginResponse } from '../../../Models/auth/loginResponse.interface';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MatDialogRefStub<T> {
  public close = jasmine.createSpy('close');
}

describe('LoginDialogComponent (standalone, OnPush)', () => {
  let fixture: ComponentFixture<LoginDialogComponent>;
  let component: LoginDialogComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let dialogRefStub: MatDialogRefStub<LoginDialogComponent>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'login',
    ]);
    dialogRefStub = new MatDialogRefStub<LoginDialogComponent>();

    await TestBed.configureTestingModule({
      imports: [LoginDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits loginSucceeded and closes dialog on successful login', fakeAsync(() => {
    component.username = 'demo';
    component.password = 'secret';
    authServiceSpy.login.and.returnValue(
      of<LoginResponse>({ token: 'abc', userId: '1' }).pipe(delay(0)),
    );
    const loginSucceededSpy = jasmine.createSpy('loginSucceeded');
    component.loginSucceeded.subscribe(loginSucceededSpy);

    component.login();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith('demo', 'secret');
    expect(loginSucceededSpy).toHaveBeenCalled();
    expect(dialogRefStub.close).toHaveBeenCalledWith(true);
  }));

  it('respects closeOnSuccess=false and keeps dialog open', fakeAsync(() => {
    component.closeOnSuccess = false;
    authServiceSpy.login.and.returnValue(
      of<LoginResponse>({ token: 'abc', userId: '1' }).pipe(delay(0)),
    );

    component.login();
    tick();

    expect(dialogRefStub.close).not.toHaveBeenCalled();
  }));

  it('logs an error when login fails', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'error');
    authServiceSpy.login.and.returnValue(throwError(() => new Error('nope')));

    component.login();
    tick();

    expect(consoleSpy).toHaveBeenCalled();
  }));
});
