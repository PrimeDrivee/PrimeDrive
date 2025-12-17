import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PurchasesService } from './purchases.service';
import { Purchases } from '../../Models/purchases/purchases.interface';

describe('PurchasesService', () => {
  let service: PurchasesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PurchasesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates a purchase', () => {
    const purchase: Purchases = {
      id: '1',
      buyerId: 'b',
      sellerId: 's',
      vehicleId: 'v',
    } as Purchases;
    service.createPurchase(purchase).subscribe();
    const req = http.expectOne('https://localhost:8443/api/purchases');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(purchase);
    expect(req.request.withCredentials).toBeTrue();
    req.flush(purchase);
  });

  it('gets all purchases', () => {
    service.getAllPurchases().subscribe();
    const req = http.expectOne('https://localhost:8443/api/purchases');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush([]);
  });

  it('gets purchase by id', () => {
    service.getPurchaseById('123').subscribe();
    const req = http.expectOne('https://localhost:8443/api/purchases/123');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deletes purchase by id', () => {
    service.deletePurchase('123').subscribe();
    const req = http.expectOne('https://localhost:8443/api/purchases/123');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
