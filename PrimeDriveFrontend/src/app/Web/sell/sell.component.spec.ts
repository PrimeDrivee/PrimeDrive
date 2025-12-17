import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { SellComponent } from './sell.component';
import { VehiclesService } from '../../Services/vehicles/vehicles.service';
import { UsersService } from '../../Services/users/users.service';
import { Vehicle } from '../../Models/vehicles/vehicle.interface';
import { Specs } from '../../Models/vehicles/specs.interface';

describe('SellComponent (standalone)', () => {
  let fixture: ComponentFixture<SellComponent>;
  let component: SellComponent;
  let vehiclesServiceMock: jasmine.SpyObj<VehiclesService>;
  let usersServiceMock: jasmine.SpyObj<UsersService>;

  beforeEach(async () => {
    vehiclesServiceMock = jasmine.createSpyObj<VehiclesService>(
      'VehiclesService',
      [
        'createSpecs',
        'createVehicle',
        'getVehicles',
        'getSpecsById',
        'getBrands',
        'getColors',
        'getTypes',
        'getDoors',
        'getSeats',
        'getEngines',
        'getFuels',
      ],
    );

    usersServiceMock = jasmine.createSpyObj<UsersService>('UsersService', [
      'getCurrentUser',
    ]);

    vehiclesServiceMock.getBrands.and.returnValue(of([]));
    vehiclesServiceMock.getColors.and.returnValue(of([]));
    vehiclesServiceMock.getTypes.and.returnValue(of([]));
    vehiclesServiceMock.getDoors.and.returnValue(of([]));
    vehiclesServiceMock.getSeats.and.returnValue(of([]));
    vehiclesServiceMock.getEngines.and.returnValue(of([]));
    vehiclesServiceMock.getFuels.and.returnValue(of([]));
    vehiclesServiceMock.getVehicles.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SellComponent, NoopAnimationsModule],
      providers: [
        { provide: VehiclesService, useValue: vehiclesServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SellComponent);
    component = fixture.componentInstance;
  });

  it('warns and marks forms when invalid', () => {
    const warnSpy = spyOn(console, 'warn');

    component.onSubmit();

    expect(warnSpy).toHaveBeenCalled();
    expect(vehiclesServiceMock.createSpecs).not.toHaveBeenCalled();
  });

  it('creates specs and vehicle when forms are valid', fakeAsync(() => {
    usersServiceMock.getCurrentUser.and.returnValue(of({ id: 'u1' } as any));
    vehiclesServiceMock.createSpecs.and.returnValue(
      of({ id: 'spec1' } as Specs),
    );
    vehiclesServiceMock.createVehicle.and.returnValue(of({} as Vehicle));

    component.form.patchValue({
      name: 'Car',
      colorsId: 'c1',
    });
    component.specsForm.patchValue({
      powerKw: 1,
      doorsId: 'd1',
      seatsId: 's1',
      engineId: 'e1',
      fuelsId: 'f1',
    });

    component.onSubmit();
    tick();

    expect(vehiclesServiceMock.createSpecs).toHaveBeenCalled();
    expect(vehiclesServiceMock.createVehicle).toHaveBeenCalled();
    expect(vehiclesServiceMock.getVehicles).toHaveBeenCalled();
  }));

  it('patches forms when editing a vehicle', fakeAsync(() => {
    const specs: Specs = { id: 'spec1', doorsId: 'd', seatsId: 's' } as Specs;
    vehiclesServiceMock.getSpecsById.and.returnValue(of(specs));
    const vehicle: Vehicle = {
      id: 'v1',
      name: 'Old',
      colorsId: 'c',
      brandsId: 'b',
      typesId: 't',
      specsId: 'spec1',
      sellerId: 'u1',
      price: 10,
      year: 2020,
      image: '',
      mileage: 0,
      condition: '',
      vehicleHistory: '',
    } as Vehicle;

    component.editVehicle(vehicle);
    tick();

    expect(component.form.value.name).toBe('Old');
    expect(component.form.value.colorsId).toBe('c');
    expect(component.specsForm.value.id).toBe('spec1');
  }));

  it('removes a vehicle locally when deleted', () => {
    component.userVehicles = [{ id: 'a' } as Vehicle, { id: 'b' } as Vehicle];

    component.deleteVehicle('b');

    expect(component.userVehicles.length).toBe(1);
    expect(component.userVehicles[0].id).toBe('a');
  });

  it('loads reference data on init and sets sellerId', fakeAsync(() => {
    usersServiceMock.getCurrentUser.and.returnValue(
      of({ id: 'user-1' } as any),
    );

    fixture.detectChanges();
    tick();

    expect(component.form.value.sellerId).toBe('user-1');
    expect(vehiclesServiceMock.getBrands).toHaveBeenCalled();
    expect(vehiclesServiceMock.getColors).toHaveBeenCalled();
    expect(vehiclesServiceMock.getTypes).toHaveBeenCalled();
    expect(vehiclesServiceMock.getDoors).toHaveBeenCalled();
    expect(vehiclesServiceMock.getSeats).toHaveBeenCalled();
    expect(vehiclesServiceMock.getEngines).toHaveBeenCalled();
    expect(vehiclesServiceMock.getFuels).toHaveBeenCalled();
  }));
});
