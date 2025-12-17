import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { VehiclesComponent } from './vehicles.component';
import { VehiclesService } from '../../Services/vehicles/vehicles.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Vehicle } from '../../Models/vehicles/vehicle.interface';
import { VehicleWithLessDetails } from '../../Models/vehicles/vehicleWithLessDetails';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const baseVehicle: Vehicle = {
  id: 'v1',
  brandsId: 'b1',
  colorsId: 'c1',
  specsId: 's1',
  sellerId: 'u1',
  typesId: 't1',
  condition: 'NEW',
  year: 2023,
  mileage: 1000,
  price: 50000,
} as Vehicle;

const buildVehicleWithDetails = (): VehicleWithLessDetails =>
  ({
    ...baseVehicle,
    brand: {
      id: 'b1',
      name: 'Brand',
      holdingId: 'h1',
      founding: 2000,
      logo: '',
    } as any,
    type: { id: 't1', type: 'SUV' } as any,
    color: { id: 'c1', name: 'Red', hexCode: '#ff0000' } as any,
    specs: {
      id: 's1',
      doorsId: 'd1',
      engineId: 'e1',
      fuelsId: 'f1',
      seatsId: 'se1',
      powerKw: 1,
      powerPs: 1,
      lengthMillimeter: 1,
      widthMillimeter: 1,
      heightMillimeter: 1,
      weight: 1,
      consumption: 1,
      torque: 1,
      doors: { id: 'd1', quantity: 4 } as any,
      engine: { id: 'e1', engineType: 'V8' } as any,
      fuel: { id: 'f1', fuelType: 'Gas' } as any,
      seats: { id: 'se1', quantity: 5 } as any,
    } as any,
    holding: { id: 'h1', name: 'Hold', logo: '', founding: 1990 } as any,
  }) as unknown as VehicleWithLessDetails;

describe('VehiclesComponent', () => {
  let fixture: ComponentFixture<VehiclesComponent>;
  let component: VehiclesComponent;
  let serviceSpy: jasmine.SpyObj<VehiclesService>;
  let router: Router;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<VehiclesService>('VehiclesService', [
      'getVehicles',
      'getBrandById',
      'getTypeById',
      'getColorById',
      'getSpecsById',
      'getDoorsById',
      'getEngineById',
      'getFuelById',
      'getSeatsById',
      'getHoldingById',
    ]);

    const specs = {
      id: 's1',
      doorsId: 'd1',
      engineId: 'e1',
      fuelsId: 'f1',
      seatsId: 'se1',
    } as any;

    serviceSpy.getVehicles.and.returnValue(of([baseVehicle]));
    serviceSpy.getBrandById.and.returnValue(
      of({
        id: 'b1',
        name: 'Brand',
        holdingId: 'h1',
        founding: 2000,
        logo: '',
      } as any),
    );
    serviceSpy.getTypeById.and.returnValue(
      of({ id: 't1', type: 'SUV' } as any),
    );
    serviceSpy.getColorById.and.returnValue(
      of({ id: 'c1', name: 'Red', hexCode: '#ff0000' } as any),
    );
    serviceSpy.getSpecsById.and.returnValue(of(specs));
    serviceSpy.getDoorsById.and.returnValue(
      of({ id: 'd1', quantity: 4 } as any),
    );
    serviceSpy.getEngineById.and.returnValue(
      of({ id: 'e1', engineType: 'V8' } as any),
    );
    serviceSpy.getFuelById.and.returnValue(
      of({ id: 'f1', fuelType: 'Gas' } as any),
    );
    serviceSpy.getSeatsById.and.returnValue(
      of({ id: 'se1', quantity: 5 } as any),
    );
    serviceSpy.getHoldingById.and.returnValue(
      of({ id: 'h1', name: 'Hold', logo: '', founding: 1990 } as any),
    );

    await TestBed.configureTestingModule({
      imports: [
        VehiclesComponent,
        RouterTestingModule.withRoutes([]),
        NoopAnimationsModule,
      ],
      providers: [{ provide: VehiclesService, useValue: serviceSpy }],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.stub();

    fixture = TestBed.createComponent(VehiclesComponent);
    component = fixture.componentInstance;
  });

  it('loads vehicles with details on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(serviceSpy.getVehicles).toHaveBeenCalled();
    expect(component.vehicles.length).toBe(1);
    expect(component.uniqueBrands).toContain('Brand');
    expect(component.uniqueTypes).toContain('SUV');
    expect(component.uniqueColors).toContain('Red');
  }));

  it('filters vehicles by brand', fakeAsync(() => {
    component.vehicles = [buildVehicleWithDetails()];
    component.filters.brand = 'Brand';
    const filtered = component.getFilteredVehicles();
    expect(filtered.length).toBe(1);

    component.filters.brand = 'Other';
    expect(component.getFilteredVehicles().length).toBe(0);
  }));

  it('filters vehicles by numeric and categorical fields', () => {
    const vehicle = buildVehicleWithDetails();
    const older = {
      ...vehicle,
      id: 'v2',
      year: 2010,
      price: 100000,
      mileage: 250000,
    };
    component.vehicles = [vehicle, older];
    component.filters = {
      brand: 'All',
      type: 'All',
      year: 2020,
      maxPrice: 60000,
      maxMileage: 200000,
      condition: 'NEW',
      holding: 'All',
      color: 'All',
      engine: 'All',
      fuel: 'All',
      seats: 'All',
      doors: 'All',
    } as any;
    const filtered = component.getFilteredVehicles();
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('v1');

    component.filters.seats = 5;
    component.filters.doors = 4;
    expect(component.getFilteredVehicles().length).toBe(1);

    component.filters.seats = 2;
    expect(component.getFilteredVehicles().length).toBe(0);
  });

  it('filters by condition, holding, color, engine and fuel', () => {
    const vehicle = buildVehicleWithDetails();
    const other = {
      ...vehicle,
      id: 'v2',
      condition: 'USED',
      holding: { id: 'h2', name: 'OtherHold', logo: '', founding: 1990 } as any,
      color: { id: 'c2', name: 'Blue', hexCode: '#0000ff' } as any,
      specs: {
        ...vehicle.specs,
        engine: { id: 'e2', engineType: 'I4' } as any,
        fuel: { id: 'f2', fuelType: 'Diesel' } as any,
        seats: { id: 's2', quantity: 2 } as any,
        doors: { id: 'd2', quantity: 2 } as any,
      } as any,
    } as VehicleWithLessDetails;

    component.vehicles = [vehicle, other];
    component.filters.condition = 'USED';
    component.filters.holding = 'OtherHold';
    component.filters.color = 'Blue';
    component.filters.engine = 'I4';
    component.filters.fuel = 'Diesel';
    component.filters.seats = 2 as any;
    component.filters.doors = 2 as any;

    const filtered = component.getFilteredVehicles();
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('v2');

    component.filters.condition = 'NEW';
    expect(component.getFilteredVehicles().length).toBe(0);
  });

  it('resets filters to defaults', () => {
    component.filters.brand = 'Brand';
    component.resetFilters();
    expect(component.filters.brand).toBe('All');
    expect(component.filters.maxPrice).toBeNull();
  });

  it('navigates to details', () => {
    component.goToVehicleDetails('v1');
    expect(router.navigate).toHaveBeenCalledWith(['/vehicles', 'v1']);
  });

  it('updates filter options when holding filter narrows available brands and types', () => {
    const base = buildVehicleWithDetails();
    const second = {
      ...base,
      id: 'v2',
      brand: {
        id: 'b2',
        name: 'Other',
        holdingId: 'h2',
        founding: 1990,
        logo: '',
      } as any,
      type: { id: 't2', type: 'Truck' } as any,
      color: { id: 'c2', name: 'Blue', hexCode: '#0000ff' } as any,
      holding: { id: 'h2', name: 'Hold2', logo: '', founding: 1990 } as any,
      specs: {
        ...base.specs,
        id: 's2',
        doors: { id: 'd2', quantity: 2 } as any,
        engine: { id: 'e2', engineType: 'I4' } as any,
        fuel: { id: 'f2', fuelType: 'Diesel' } as any,
        seats: { id: 'se2', quantity: 2 } as any,
      } as any,
    } as VehicleWithLessDetails;

    component.vehicles = [base, second];
    component.filters.holding = 'Hold2';
    component.updateFilterOptions();
    expect(component.uniqueBrands).toContain('Other');
    expect(component.uniqueTypes).toContain('Truck');

    component.filters.brand = 'Brand';
    component.filters.holding = 'All';
    component.updateFilterOptions();
    expect(component.uniqueTypes).toContain('SUV');
  });

  it('uses all vehicles as type source when no brand or holding filter is set', () => {
    const first = buildVehicleWithDetails();
    const second = {
      ...first,
      id: 'v2',
      brand: { ...first.brand, id: 'b2', name: 'Other' } as any,
      type: { id: 't2', type: 'Truck' } as any,
    } as VehicleWithLessDetails;

    component.vehicles = [first, second];
    component.filters = {
      brand: 'All',
      type: 'All',
      year: null as any,
      maxPrice: null as any,
      maxMileage: null as any,
      condition: 'All',
      holding: 'All',
      color: 'All',
      engine: 'All',
      fuel: 'All',
      seats: 'All',
      doors: 'All',
    } as any;

    component.updateFilterOptions();
    expect(component.uniqueTypes).toContain('SUV');
    expect(component.uniqueTypes).toContain('Truck');
  });

  it('skips color lookup when vehicle has no color id', fakeAsync(() => {
    serviceSpy.getVehicles.and.returnValue(
      of([{ ...baseVehicle, colorsId: null as any } as Vehicle]),
    );
    const consoleSpy = spyOn(console, 'error');

    fixture.detectChanges();
    tick();

    expect(serviceSpy.getColorById).not.toHaveBeenCalled();
    expect(component.uniqueColors).toEqual(['All']);
    expect(consoleSpy).not.toHaveBeenCalled();
  }));

  it('logs an error when loading vehicles fails', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'error');
    serviceSpy.getVehicles.and.returnValue(throwError(() => new Error('fail')));

    fixture.detectChanges();
    tick();

    expect(consoleSpy).toHaveBeenCalled();
    expect(component.vehicles.length).toBe(0);
  }));
});
