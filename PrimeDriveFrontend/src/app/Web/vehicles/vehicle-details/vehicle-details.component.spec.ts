import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { VehicleDetailsComponent } from './vehicle-details.component';
import { VehiclesService } from '../../../Services/vehicles/vehicles.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const buildServiceSpy = () => {
  const spy = jasmine.createSpyObj<VehiclesService>('VehiclesService', [
    'getVehicleById',
    'getBrandById',
    'getTypeById',
    'getColorById',
    'getSpecsById',
    'getUserById',
    'getEngineById',
    'getFuelById',
    'getDoorsById',
    'getSeatsById',
  ]);
  const vehicle = {
    id: 'v1',
    brandsId: 'b1',
    typesId: 't1',
    colorsId: 'c1',
    specsId: 's1',
    sellerId: 'u1',
  } as any;
  spy.getVehicleById.and.returnValue(of(vehicle));
  spy.getBrandById.and.returnValue(
    of({
      id: 'b1',
      name: 'Brand',
      holdingId: 'h1',
      founding: 2000,
      logo: '',
    } as any),
  );
  spy.getTypeById.and.returnValue(
    of({ id: 't1', type: 'SUV', name: 'Type' } as any),
  );
  spy.getColorById.and.returnValue(
    of({ id: 'c1', name: 'Red', hexCode: '#ff0000' } as any),
  );
  spy.getSpecsById.and.returnValue(
    of({
      id: 's1',
      engineId: 'e1',
      fuelsId: 'f1',
      doorsId: 'd1',
      seatsId: 'se1',
    } as any),
  );
  spy.getUserById.and.returnValue(of({ id: 'u1', username: 'seller' } as any));
  spy.getEngineById.and.returnValue(of({ id: 'e1', engineType: 'V8' } as any));
  spy.getFuelById.and.returnValue(of({ id: 'f1', fuelType: 'Gas' } as any));
  spy.getDoorsById.and.returnValue(of({ id: 'd1', quantity: 4 } as any));
  spy.getSeatsById.and.returnValue(of({ id: 'se1', quantity: 5 } as any));
  return spy;
};

describe('VehicleDetailsComponent', () => {
  let fixture: ComponentFixture<VehicleDetailsComponent>;
  let component: VehicleDetailsComponent;
  let serviceSpy: jasmine.SpyObj<VehiclesService>;

  beforeEach(async () => {
    serviceSpy = buildServiceSpy();

    await TestBed.configureTestingModule({
      imports: [VehicleDetailsComponent, NoopAnimationsModule],
      providers: [
        { provide: VehiclesService, useValue: serviceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'v1' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleDetailsComponent);
    component = fixture.componentInstance;
  });

  it('loads vehicle details and aggregates related data', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(serviceSpy.getVehicleById).toHaveBeenCalledWith('v1');
    expect(component.vehicle).toBeDefined();
    expect(component.vehicle.brand?.name).toBe('Brand');
    expect(component.vehicle.specs?.engine?.engineType).toBe('V8');
    expect(component.vehicle.seller?.username).toBe('seller');
  }));

  it('logs an error when route id is missing', () => {
    const errorSpy = spyOn(console, 'error');
    (component as any).route = {
      snapshot: { paramMap: { get: () => null } },
    } as any;

    component.ngOnInit();

    expect(serviceSpy.getVehicleById).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('maps string responses for brand, type and color', fakeAsync(() => {
    serviceSpy.getBrandById.and.returnValue(of('BrandString' as any));
    serviceSpy.getTypeById.and.returnValue(of('TypeString' as any));
    serviceSpy.getColorById.and.returnValue(of('RedString' as any));

    fixture.detectChanges();
    tick();

    expect(component.vehicle.brand?.name).toBe('BrandString');
    expect((component.vehicle.type as any).name).toBe('TypeString');
    expect(component.vehicle.color?.name).toBe('RedString');
  }));

  it('logs an error when fetching vehicle details fails', fakeAsync(() => {
    const errorSpy = spyOn(console, 'error');
    serviceSpy.getVehicleById.and.returnValue(
      throwError(() => new Error('fail')),
    );

    fixture.detectChanges();
    tick();

    expect(errorSpy).toHaveBeenCalled();
  }));
});
