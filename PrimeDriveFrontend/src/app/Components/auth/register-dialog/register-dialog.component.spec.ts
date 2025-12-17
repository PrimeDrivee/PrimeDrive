import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterDialogComponent } from './register-dialog.component';
import { AuthService } from '../../../Services/auth/auth.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpErrorResponse } from '@angular/common/http';

describe('RegisterDialogComponent', () => {
  let fixture: ComponentFixture<RegisterDialogComponent>;
  let component: RegisterDialogComponent;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterDialogComponent, NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterDialogComponent);
    component = fixture.componentInstance;
    authSpy.register.and.returnValue(of({}));
  });

  it('calls register with converted birthdate format', () => {
    component.username = 'demo';
    component.password = 'p';
    component.confirmPassword = 'p';
    component.firstName = 'A';
    component.lastName = 'B';
    component.email = 'a@example.com';
    component.birthdate = '2024-01-02';
    component.address = 'Street 1';
    component.zipCode = '8000';
    component.city = 'ZH';
    component.country = 'CH';
    component.phoneNumber = '0123456789';

    component.register();

    expect(authSpy.register).toHaveBeenCalledTimes(1);
    const arg = authSpy.register.calls.mostRecent().args[0] as any;
    expect(arg.birthdate).toBe('02.01.2024');
    expect(arg.username).toBe('demo');
  });

  it('logs client and server errors on register failure', () => {
    const consoleSpy = spyOn(console, 'error');
    authSpy.register.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 500,
            error: 'fail',
          }),
      ),
    );

    component.register();
    expect(consoleSpy).toHaveBeenCalled();

    authSpy.register.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 0,
            error: new ErrorEvent('network', { message: 'down' }),
          }),
      ),
    );
    component.register();
    expect(consoleSpy).toHaveBeenCalledTimes(2);
  });

  it('sets validation errors for mismatch, zip and phone', () => {
    const makeModel = () =>
      ({
        control: {
          setErrors: jasmine.createSpy('setErrors'),
          updateValueAndValidity: jasmine.createSpy('update'),
        },
        valid: true,
        errors: {},
      }) as any;

    component.password = 'p1';
    component.confirmPassword = 'p2';
    component.zipCode = 'abcd';
    component.phoneNumber = '123';
    component.passwordModel = makeModel();
    component.confirmPasswordModel = makeModel();
    component.zipCodeModel = makeModel();
    component.phoneNumberModel = makeModel();

    component.ngAfterViewChecked();

    expect(
      component.confirmPasswordModel.control.setErrors,
    ).toHaveBeenCalledWith({ mismatch: true });
    expect(component.zipCodeModel.control.setErrors).toHaveBeenCalled();
    expect(component.phoneNumberModel.control.setErrors).toHaveBeenCalled();
  });

  it('clears validation errors when values become valid', () => {
    const makeModelWithError = (key: string) =>
      ({
        control: {
          setErrors: jasmine.createSpy('setErrors'),
          updateValueAndValidity: jasmine.createSpy('update'),
        },
        valid: true,
        errors: { [key]: true },
      }) as any;

    component.password = 'p1';
    component.confirmPassword = 'p1';
    component.zipCode = '8000';
    component.phoneNumber = '0123456789';
    component.passwordModel = makeModelWithError('mismatch');
    component.confirmPasswordModel = makeModelWithError('mismatch');
    component.zipCodeModel = makeModelWithError('invalidZip');
    component.phoneNumberModel = makeModelWithError('invalidPhone');

    component.ngAfterViewChecked();

    expect(
      component.confirmPasswordModel.control.setErrors,
    ).toHaveBeenCalledWith(null);
    expect(component.zipCodeModel.control.setErrors).toHaveBeenCalledWith(null);
    expect(component.phoneNumberModel.control.setErrors).toHaveBeenCalledWith(
      null,
    );
  });
});
