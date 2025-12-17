import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginResponse } from '../../Models/auth/loginResponse.interface';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('calls login endpoint with credentials', () => {
    const credentials = { username: 'demo', password: 'secret' };
    let response: LoginResponse | undefined;

    service
      .login(credentials.username, credentials.password)
      .subscribe((res) => {
        response = res;
      });

    const req = http.expectOne(
      'https://localhost:8443/api/authentication/login',
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    expect(req.request.body).toEqual(credentials);

    req.flush({ token: 'abc', userId: '1' });
    expect(response).toEqual({ token: 'abc', userId: '1' });
  });

  it('calls logout endpoint', () => {
    service.logout().subscribe();
    const req = http.expectOne(
      'https://localhost:8443/api/authentication/logout',
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({});
  });

  it('checks authentication status', () => {
    let value: boolean | undefined;
    service.isAuthenticated().subscribe((v) => (value = v));
    const req = http.expectOne(
      'https://localhost:8443/api/authentication/check-session',
    );
    expect(req.request.method).toBe('GET');
    req.flush(true);
    expect(value).toBeTrue();
  });

  it('registers a new user', () => {
    const payload = { username: 'new', password: 'pw' };
    let response: unknown;

    service.register(payload).subscribe((res) => (response = res));

    const req = http.expectOne(
      'https://localhost:8443/api/authentication/register',
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.withCredentials).toBeTrue();

    req.flush({ ok: true });
    expect(response).toEqual({ ok: true });
  });
});
