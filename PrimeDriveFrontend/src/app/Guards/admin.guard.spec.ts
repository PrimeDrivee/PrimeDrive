import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminGuard, adminGuard } from './admin.guard';
import { UsersService } from '../Services/users/users.service';
import { User } from '../Models/vehicles/user.interface';

describe('AdminGuard (class)', () => {
  let guard: AdminGuard;
  let usersServiceMock: jasmine.SpyObj<UsersService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    usersServiceMock = jasmine.createSpyObj('UsersService', ['getCurrentUser']);
    routerMock = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    guard = TestBed.inject(AdminGuard);
  });

  it('allows activation for admin users', async () => {
    const adminUser: User = {
      id: '1',
      username: 'admin',
      role: 'ADMIN',
      eMail: 'a@b.c',
      birthDate: '',
      address: '',
      zipCode: '',
      city: '',
      country: '',
      phoneNumber: '',
    };
    usersServiceMock.getCurrentUser.and.returnValue(of(adminUser));

    const result = await guard.canActivate();

    expect(result).toBeTrue();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('redirects non-admin users', async () => {
    const nonAdmin: User = {
      id: '2',
      username: 'user',
      role: 'USER',
      eMail: 'u@b.c',
      birthDate: '',
      address: '',
      zipCode: '',
      city: '',
      country: '',
      phoneNumber: '',
    };
    usersServiceMock.getCurrentUser.and.returnValue(of(nonAdmin));

    const result = await guard.canActivate();

    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/vehicles']);
  });

  it('redirects when fetching user fails', async () => {
    usersServiceMock.getCurrentUser.and.returnValue(
      throwError(() => new Error('network')),
    );

    const result = await guard.canActivate();

    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/vehicles']);
  });
});

describe('adminGuard (functional)', () => {
  let usersServiceMock: jasmine.SpyObj<UsersService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    usersServiceMock = jasmine.createSpyObj('UsersService', ['getCurrentUser']);
    routerMock = jasmine.createSpyObj('Router', ['createUrlTree']);
    routerMock.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('returns true for admin users', async () => {
    const adminUser: User = {
      id: '1',
      username: 'admin',
      role: 'ADMIN',
      eMail: 'a@b.c',
      birthDate: '',
      address: '',
      zipCode: '',
      city: '',
      country: '',
      phoneNumber: '',
    };
    usersServiceMock.getCurrentUser.and.returnValue(of(adminUser));

    const result = await TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any),
    );

    expect(result).toBeTrue();
  });

  it('returns UrlTree for non-admin users', async () => {
    const urlTree = { redirect: true } as unknown as UrlTree;
    routerMock.createUrlTree.and.returnValue(urlTree);
    const nonAdmin: User = {
      id: '2',
      username: 'user',
      role: 'USER',
      eMail: 'u@b.c',
      birthDate: '',
      address: '',
      zipCode: '',
      city: '',
      country: '',
      phoneNumber: '',
    };
    usersServiceMock.getCurrentUser.and.returnValue(of(nonAdmin));

    const result = await TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any),
    );

    expect(result).toBe(urlTree);
  });
});
