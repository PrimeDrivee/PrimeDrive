import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { NavigationComponent } from './navigation.component';
import { AuthService } from '../../Services/auth/auth.service';
import { UsersService } from '../../Services/users/users.service';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../Models/vehicles/user.interface';

describe('NavigationComponent (standalone, OnPush)', () => {
  let fixture: ComponentFixture<NavigationComponent>;
  let component: NavigationComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'isAuthenticated',
      'logout',
    ]);
    usersServiceSpy = jasmine.createSpyObj<UsersService>('UsersService', [
      'getCurrentUser',
    ]);
    dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [NavigationComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    component.reloadOnLogout = false; // avoid reload side effects
    (component as unknown as { dialog: MatDialog }).dialog =
      dialogSpy as unknown as MatDialog;
  });

  it('initializes login state and admin flag when authenticated', fakeAsync(() => {
    const user: User = { id: '1', username: 'admin', role: 'ADMIN' } as User;
    authServiceSpy.isAuthenticated.and.returnValue(of(true));
    usersServiceSpy.getCurrentUser.and.returnValue(of(user));

    fixture.detectChanges();
    tick();

    expect(component['isLoggedIn']).toBeTrue();
    expect(component['isAdmin']).toBeTrue();
  }));

  it('emits logoutCompleted without reloading when reloadOnLogout is false', fakeAsync(() => {
    authServiceSpy.logout.and.returnValue(of(void 0));
    const logoutSpy = jasmine.createSpy('logoutSpy');
    component.logoutCompleted.subscribe(logoutSpy);

    component.logout();
    tick();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(logoutSpy).toHaveBeenCalledOnceWith(true);
  }));

  it('emits failure when logout errors', fakeAsync(() => {
    component.reloadOnLogout = false;
    authServiceSpy.logout.and.returnValue(throwError(() => new Error('fail')));
    const logoutSpy = jasmine.createSpy('logoutSpy');
    const errorSpy = spyOn(console, 'error').and.stub();
    component.logoutCompleted.subscribe(logoutSpy);
    component.logout();
    tick();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(logoutSpy).toHaveBeenCalledWith(false);
    expect(errorSpy).toHaveBeenCalled();
  }));

  it('emits loginStateChanged after dialog confirms login', fakeAsync(() => {
    const loginStateSpy = jasmine.createSpy('loginStateChanged');
    component.loginStateChanged.subscribe(loginStateSpy);
    const afterClosed$ = of(true);
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosed$,
      close: () => {},
      componentInstance: {},
      addPanelClass: () => {},
      removePanelClass: () => {},
      updatePosition: () => {},
      updateSize: () => {},
      backdropClick: () => of(true),
      keydownEvents: () => of(),
      beforeClosed: () => of(true),
      afterOpened: () => of(true),
      getState: () => 'OPEN',
    } as unknown as ReturnType<MatDialog['open']>);
    authServiceSpy.isAuthenticated.and.returnValue(of(true));
    usersServiceSpy.getCurrentUser.and.returnValue(
      of({ role: 'USER' } as User),
    );

    component.openLoginDialog();
    tick();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(loginStateSpy).toHaveBeenCalledWith(true);
  }));

  it('does nothing when login dialog closes without confirmation', fakeAsync(() => {
    const afterClosed$ = of(false);
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosed$,
      close: () => {},
      componentInstance: {},
      addPanelClass: () => {},
      removePanelClass: () => {},
      updatePosition: () => {},
      updateSize: () => {},
      backdropClick: () => of(true),
      keydownEvents: () => of(),
      beforeClosed: () => of(true),
      afterOpened: () => of(true),
      getState: () => 'OPEN',
    } as unknown as ReturnType<MatDialog['open']>);

    component.openLoginDialog();
    tick();

    expect(authServiceSpy.isAuthenticated).not.toHaveBeenCalled();
  }));

  it('opens the register dialog', () => {
    dialogSpy.open.and.returnValue({} as any);

    component.openRegisterDialog();

    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('reloads the page when logout succeeds and reloadOnLogout is true', fakeAsync(() => {
    component.reloadOnLogout = true;
    authServiceSpy.logout.and.returnValue(of(void 0));
    const reloadSpy = jasmine.createSpy('reload');
    (component as unknown as { reloadFn: () => void }).reloadFn = reloadSpy;

    component.logout();
    tick();

    expect(reloadSpy).toHaveBeenCalled();
  }));

  it('handles unauthenticated state without fetching user', fakeAsync(() => {
    authServiceSpy.isAuthenticated.and.returnValue(of(false));
    const loginStateSpy = jasmine.createSpy('loginStateChanged');
    component.loginStateChanged.subscribe(loginStateSpy);

    fixture.detectChanges();
    tick();

    expect(usersServiceSpy.getCurrentUser).not.toHaveBeenCalled();
    expect(loginStateSpy).toHaveBeenCalledWith(false);
  }));
});
