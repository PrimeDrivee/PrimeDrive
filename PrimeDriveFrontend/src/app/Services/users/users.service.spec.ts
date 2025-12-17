import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { User } from '../../Models/vehicles/user.interface';

describe('UsersService', () => {
  let service: UsersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(UsersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches current user', () => {
    const mockUser = { id: '1', username: 'demo', role: 'ADMIN' } as User;
    let result: User | undefined;

    service.getCurrentUser().subscribe((u) => (result = u));

    const req = http.expectOne('https://localhost:8443/api/users/current');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockUser);

    expect(result).toEqual(mockUser);
  });

  it('fetches user by id', () => {
    const mockUser = { id: '2', username: 'alice', role: 'USER' } as User;
    let result: User | undefined;

    service.getUserById('2').subscribe((u) => (result = u));

    const req = http.expectOne('https://localhost:8443/api/users/2');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockUser);

    expect(result).toEqual(mockUser);
  });
});
