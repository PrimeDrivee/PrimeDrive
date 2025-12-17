import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DataManagementComponent } from './data-management.component';
import { VehiclesService } from '../../../Services/vehicles/vehicles.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const createVehiclesServiceSpy = () => {
  const methods = [
    'getColors',
    'getDoors',
    'getEngines',
    'getFuels',
    'getHoldings',
    'getSeats',
    'getTypes',
    'getBrands',
    'createColor',
    'updateColor',
    'deleteColor',
    'createDoors',
    'updateDoors',
    'deleteDoors',
    'createEngine',
    'updateEngine',
    'deleteEngine',
    'createFuel',
    'updateFuel',
    'deleteFuel',
    'createHolding',
    'updateHolding',
    'deleteHolding',
    'createSeats',
    'updateSeats',
    'deleteSeats',
    'createType',
    'updateType',
    'deleteType',
    'createBrand',
    'updateBrand',
    'deleteBrand',
  ] as const;
  const spy = jasmine.createSpyObj(
    'VehiclesService',
    methods,
  ) as any as jasmine.SpyObj<VehiclesService>;
  methods.forEach((name) => {
    if (name.startsWith('get')) {
      (spy as any)[name].and.returnValue(of([] as any));
    } else if (name.startsWith('delete')) {
      (spy as any)[name].and.returnValue(of({} as any));
    } else if (name.startsWith('create') || name.startsWith('update')) {
      (spy as any)[name].and.callFake((body?: any) => of(body ?? {}));
    }
  });
  return spy;
};

describe('DataManagementComponent', () => {
  let fixture: ComponentFixture<DataManagementComponent>;
  let component: DataManagementComponent;
  let serviceSpy: jasmine.SpyObj<VehiclesService>;

  beforeEach(async () => {
    serviceSpy = createVehiclesServiceSpy();

    await TestBed.configureTestingModule({
      imports: [
        DataManagementComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
      providers: [{ provide: VehiclesService, useValue: serviceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataManagementComponent);
    component = fixture.componentInstance;
    // Ensure the component uses the spy instead of creating a real service instance.
    (component as any).vehiclesService = serviceSpy;
    fixture.detectChanges();
  });

  it('initializes forms and loads reference data on init', () => {
    expect(serviceSpy.getColors).toHaveBeenCalled();
    expect(serviceSpy.getBrands).toHaveBeenCalled();
    expect(component.colorForm).toBeTruthy();
    expect(component.brandForm).toBeTruthy();
  });

  it('updates and deletes color successfully and resets state', () => {
    component.selectedColor = {
      id: 'c1',
      name: 'Red',
      hexCode: '#ff0000',
    } as any;
    component.colorUpdateForm.patchValue({ name: 'Blue', hexCode: '#0000ff' });

    component.updateColor();
    expect(serviceSpy.updateColor).toHaveBeenCalled();
    expect(component.selectedColor).toBeNull();
    expect(component.errorMessageUpdate).toBeNull();

    component.selectedColor = {
      id: 'c1',
      name: 'Red',
      hexCode: '#ff0000',
    } as any;
    component.deleteColor('c1');
    expect(serviceSpy.deleteColor).toHaveBeenCalledWith('c1');
    expect(component.selectedColor).toBeNull();
  });

  it('sets error when color form invalid on create', () => {
    component.colorForm.patchValue({ name: '', hexCode: 'bad' });
    component.createColor();
    expect(component.errorMessageCreate).toBeTruthy();
    expect(serviceSpy.createColor).not.toHaveBeenCalled();
  });

  it('creates color when form valid and resets form', fakeAsync(() => {
    component.colorForm.patchValue({ name: 'Red', hexCode: '#ff0000' });
    component.createColor();
    tick();
    expect(serviceSpy.createColor).toHaveBeenCalled();
    expect(component.errorMessageCreate).toBeNull();
  }));

  it('selectColor patches update form and sets selectedColor', () => {
    const color = { id: 'c1', name: 'Red', hexCode: '#ff0000' } as any;
    component.selectColor(color);
    expect(component.selectedColor?.id).toBe('c1');
    expect(component.colorUpdateForm.value.name).toBe('Red');
  });

  it('fetchColorByName clears selection when no match', () => {
    component.colors = [{ id: 'c1', name: 'Red', hexCode: '#ff0000' } as any];
    component.searchedColorName = 'Green';
    component.fetchColorByName();
    expect(component.selectedColor).toBeNull();
  });

  it('fetchColorByName selects matching color', () => {
    component.colors = [{ id: 'c1', name: 'Red', hexCode: '#ff0000' } as any];
    component.searchedColorName = 'red';
    component.fetchColorByName();
    expect(component.selectedColor?.id).toBe('c1');
  });

  it('deleteColor exits early when no id', () => {
    component.selectedColor = null;
    component.deleteColor();
    expect(serviceSpy.deleteColor).not.toHaveBeenCalled();
  });

  it('guards delete and update when selection missing for other entities', () => {
    component.selectedDoors = null;
    component.deleteDoors();
    expect(serviceSpy.deleteDoors).not.toHaveBeenCalled();

    component.selectedFuel = null;
    component.updateFuel();
    expect(serviceSpy.updateFuel).not.toHaveBeenCalled();

    component.selectedSeats = null;
    component.updateSeats();
    expect(serviceSpy.updateSeats).not.toHaveBeenCalled();

    component.selectedHolding = null;
    component.deleteHolding();
    expect(serviceSpy.deleteHolding).not.toHaveBeenCalled();
  });

  it('handles validation guards and error callbacks', () => {
    component.typeForm.patchValue({ type: '' });
    component.createType();
    expect(component.errorMessageCreate).toContain('type fields');

    serviceSpy.updateEngine.calls.reset();
    component.selectedEngine = null;
    component.updateEngine();
    expect(serviceSpy.updateEngine).not.toHaveBeenCalled();

    serviceSpy.updateColor.and.returnValue(
      throwError(() => ({ error: { message: 'bad color' } })),
    );
    component.selectedColor = {
      id: 'c1',
      name: 'Red',
      hexCode: '#ff0000',
    } as any;
    component.colorUpdateForm.patchValue({ name: 'New', hexCode: '#00ff00' });
    component.updateColor();
    expect(component.errorMessageUpdate).toBe('bad color');

    serviceSpy.createHolding.and.returnValue(
      throwError(() => ({ error: { message: 'fail holding' } })),
    );
    component.holdingForm.patchValue({
      name: 'Hold',
      logo: 'Logo',
      founding: 1975,
    });
    component.createHolding();
    expect(component.errorMessageCreate).toBe('fail holding');

    serviceSpy.createEngine.and.returnValue(of({} as any));
    component.engineForm.reset({ engineType: '' });
    component.createEngine();
    expect(component.errorMessageCreate).toContain('engine');

    component.errorMessageCreate = 'x';
    component.errorMessageUpdate = 'y';
    component.onTabChange();
    expect(component.errorMessageCreate).toBeNull();
    expect(component.errorMessageUpdate).toBeNull();
  });

  it('stops invalid create calls and delete calls without ids', () => {
    serviceSpy.createDoors.calls.reset();
    component.doorsForm.reset({ quantity: 0 });
    component.createDoors();
    expect(serviceSpy.createDoors).not.toHaveBeenCalled();
    expect(component.errorMessageCreate).toContain('doors fields');

    serviceSpy.createSeats.calls.reset();
    component.seatsForm.reset({ quantity: 0 });
    component.createSeats();
    expect(serviceSpy.createSeats).not.toHaveBeenCalled();
    expect(component.errorMessageCreate).toContain('seats fields');

    serviceSpy.createFuel.calls.reset();
    component.fuelForm.reset({ fuelType: '' });
    component.createFuel();
    expect(serviceSpy.createFuel).not.toHaveBeenCalled();
    expect(component.errorMessageCreate).toContain('fuel fields');

    serviceSpy.createBrand.calls.reset();
    component.brandForm.reset({
      name: '',
      logo: '',
      founding: null as any,
      holdingId: '',
    });
    component.createBrand();
    expect(serviceSpy.createBrand).not.toHaveBeenCalled();
    expect(component.errorMessageCreate).toContain('brand fields');

    component.selectedEngine = null;
    component.deleteEngine();
    expect(serviceSpy.deleteEngine).not.toHaveBeenCalled();

    component.selectedFuel = null;
    component.deleteFuel();
    expect(serviceSpy.deleteFuel).not.toHaveBeenCalled();

    component.selectedSeats = null;
    component.deleteSeats();
    expect(serviceSpy.deleteSeats).not.toHaveBeenCalled();

    component.selectedType = null;
    component.deleteType();
    expect(serviceSpy.deleteType).not.toHaveBeenCalled();

    component.selectedBrand = null;
    component.deleteBrand();
    expect(serviceSpy.deleteBrand).not.toHaveBeenCalled();
  });

  it('guards update flows when selection missing and blocks invalid holding create', () => {
    serviceSpy.updateType.calls.reset();
    component.selectedType = null;
    component.updateType();
    expect(serviceSpy.updateType).not.toHaveBeenCalled();

    serviceSpy.updateBrand.calls.reset();
    component.selectedBrand = null;
    component.updateBrand();
    expect(serviceSpy.updateBrand).not.toHaveBeenCalled();

    serviceSpy.updateHolding.calls.reset();
    component.selectedHolding = null;
    component.updateHolding();
    expect(serviceSpy.updateHolding).not.toHaveBeenCalled();

    serviceSpy.updateColor.calls.reset();
    component.selectedColor = null;
    component.updateColor();
    expect(serviceSpy.updateColor).not.toHaveBeenCalled();

    serviceSpy.createHolding.calls.reset();
    component.holdingForm.reset({ name: '', logo: '', founding: 0 });
    component.createHolding();
    expect(serviceSpy.createHolding).not.toHaveBeenCalled();
    expect(component.errorMessageCreate).toContain('holding');
  });

  it('fetch helpers return null when no matches', () => {
    component.doors = [{ id: 'd1', quantity: 4 } as any];
    component.searchedDoorsName = '2';
    component.fetchDoorsByName();
    expect(component.selectedDoors).toBeNull();

    component.engines = [{ id: 'e1', engineType: 'V8' } as any];
    component.searchedEngineName = 'i4';
    component.fetchEngineByName();
    expect(component.selectedEngine).toBeNull();

    component.fuels = [{ id: 'f1', fuelType: 'Gas' } as any];
    component.searchedFuelName = 'diesel';
    component.fetchFuelByName();
    expect(component.selectedFuel).toBeNull();

    component.holdings = [
      { id: 'h1', name: 'Hold', logo: '', founding: 1990 } as any,
    ];
    component.searchedHoldingName = 'other';
    component.fetchHoldingByName();
    expect(component.selectedHolding).toBeNull();

    component.seats = [{ id: 's1', quantity: 5 } as any];
    component.searchedSeatsName = '2';
    component.fetchSeatsByName();
    expect(component.selectedSeats).toBeNull();

    component.types = [{ id: 't1', type: 'SUV' } as any];
    component.searchedTypeName = 'truck';
    component.fetchTypeByName();
    expect(component.selectedType).toBeNull();

    component.brands = [
      {
        id: 'b1',
        name: 'Brand',
        logo: '',
        founding: 2000,
        holdingId: 'h1',
      } as any,
    ];
    component.searchedBrandName = 'other';
    component.fetchBrandByName();
    expect(component.selectedBrand).toBeNull();
  });

  it('handles backend errors across entities', () => {
    const error$ = (msg: string) =>
      throwError(() => ({ error: { message: msg } }));

    serviceSpy.updateDoors.and.returnValue(error$('doors'));
    component.selectedDoors = { id: 'd1', quantity: 4 } as any;
    component.doorsUpdateForm.patchValue({ quantity: 3 });
    component.updateDoors();
    expect(component.errorMessageUpdate).toBe('doors');

    serviceSpy.deleteDoors.and.returnValue(error$('doors-del'));
    component.deleteDoors('d1');
    expect(component.errorMessageUpdate).toBe('doors-del');

    serviceSpy.createDoors.and.returnValue(error$('doors-create'));
    component.doorsForm.patchValue({ quantity: 2 });
    component.createDoors();
    expect(component.errorMessageCreate).toBe('doors-create');

    serviceSpy.updateEngine.and.returnValue(error$('engine'));
    component.selectedEngine = { id: 'e1', engineType: 'V8' } as any;
    component.engineUpdateForm.patchValue({ engineType: 'V6' });
    component.updateEngine();
    expect(component.errorMessageUpdate).toBe('engine');

    serviceSpy.deleteEngine.and.returnValue(error$('engine-del'));
    component.deleteEngine('e1');
    expect(component.errorMessageUpdate).toBe('engine-del');

    serviceSpy.createEngine.and.returnValue(error$('engine-create'));
    component.engineForm.patchValue({ engineType: 'V12' });
    component.createEngine();
    expect(component.errorMessageCreate).toBe('engine-create');

    serviceSpy.updateFuel.and.returnValue(error$('fuel'));
    component.selectedFuel = { id: 'f1', fuelType: 'Gas' } as any;
    component.fuelUpdateForm.patchValue({ fuelType: 'Diesel' });
    component.updateFuel();
    expect(component.errorMessageUpdate).toBe('fuel');

    serviceSpy.deleteFuel.and.returnValue(error$('fuel-del'));
    component.deleteFuel('f1');
    expect(component.errorMessageUpdate).toBe('fuel-del');

    serviceSpy.createFuel.and.returnValue(error$('fuel-create'));
    component.fuelForm.patchValue({ fuelType: 'Hydrogen' });
    component.createFuel();
    expect(component.errorMessageCreate).toBe('fuel-create');

    serviceSpy.updateHolding.and.returnValue(error$('holding'));
    component.selectedHolding = {
      id: 'h1',
      name: 'Hold',
      logo: '',
      founding: 1990,
    } as any;
    component.holdingUpdateForm.patchValue({
      name: 'Hold2',
      logo: 'L',
      founding: 2000,
    });
    component.updateHolding();
    expect(component.errorMessageUpdate).toBe('holding');

    serviceSpy.deleteHolding.and.returnValue(error$('holding-del'));
    component.deleteHolding('h1');
    expect(component.errorMessageUpdate).toBe('holding-del');

    serviceSpy.createHolding.and.returnValue(error$('holding-create'));
    component.holdingForm.patchValue({ name: 'H', logo: 'L', founding: 1970 });
    component.createHolding();
    expect(component.errorMessageCreate).toBe('holding-create');

    serviceSpy.updateSeats.and.returnValue(error$('seats'));
    component.selectedSeats = { id: 's1', quantity: 5 } as any;
    component.seatsUpdateForm.patchValue({ quantity: 4 });
    component.updateSeats();
    expect(component.errorMessageUpdate).toBe('seats');

    serviceSpy.deleteSeats.and.returnValue(error$('seats-del'));
    component.deleteSeats('s1');
    expect(component.errorMessageUpdate).toBe('seats-del');

    serviceSpy.createSeats.and.returnValue(error$('seats-create'));
    component.seatsForm.patchValue({ quantity: 3 });
    component.createSeats();
    expect(component.errorMessageCreate).toBe('seats-create');

    serviceSpy.updateType.and.returnValue(error$('type'));
    component.selectedType = { id: 't1', type: 'SUV' } as any;
    component.typeUpdateForm.patchValue({ type: 'Coupe' });
    component.updateType();
    expect(component.errorMessageUpdate).toBe('type');

    serviceSpy.deleteType.and.returnValue(error$('type-del'));
    component.deleteType('t1');
    expect(component.errorMessageUpdate).toBe('type-del');

    serviceSpy.createType.and.returnValue(error$('type-create'));
    component.typeForm.patchValue({ type: 'Truck' });
    component.createType();
    expect(component.errorMessageCreate).toBe('type-create');

    serviceSpy.updateBrand.and.returnValue(error$('brand'));
    component.selectedBrand = {
      id: 'b1',
      name: 'Brand',
      logo: '',
      founding: 2000,
      holdingId: 'h1',
    } as any;
    component.brandUpdateForm.patchValue({
      name: 'B2',
      logo: 'L',
      founding: 2001,
      holdingId: 'h1',
    });
    component.updateBrand();
    expect(component.errorMessageUpdate).toBe('brand');

    serviceSpy.deleteBrand.and.returnValue(error$('brand-del'));
    component.deleteBrand('b1');
    expect(component.errorMessageUpdate).toBe('brand-del');

    serviceSpy.createBrand.and.returnValue(error$('brand-create'));
    component.brandForm.patchValue({
      name: 'New',
      logo: 'L',
      founding: 1999,
      holdingId: 'h1',
    });
    component.createBrand();
    expect(component.errorMessageCreate).toBe('brand-create');

    serviceSpy.updateColor.and.returnValue(error$('color'));
    component.selectedColor = {
      id: 'c1',
      name: 'Red',
      hexCode: '#ff0000',
    } as any;
    component.colorUpdateForm.patchValue({ name: 'Blue', hexCode: '#0000ff' });
    component.updateColor();
    expect(component.errorMessageUpdate).toBe('color');

    serviceSpy.deleteColor.and.returnValue(error$('color-del'));
    component.selectedColor = {
      id: 'c1',
      name: 'Red',
      hexCode: '#ff0000',
    } as any;
    component.deleteColor();
    expect(component.errorMessageUpdate).toBe('color-del');

    serviceSpy.createColor.and.returnValue(error$('color-create'));
    component.colorForm.patchValue({ name: 'Red', hexCode: '#ff0000' });
    component.createColor();
    expect(component.errorMessageCreate).toBe('color-create');
  });

  it('updates holding id on selection when brand exists', () => {
    component.selectedBrand = {
      id: 'b1',
      name: 'Brand',
      logo: '',
      founding: 2000,
      holdingId: 'h1',
    } as any;
    component.onHoldingSelectedForBrand({ id: 'h2' } as any);
    expect((component.selectedBrand as any).holdingId).toBe('h2');

    component.selectedBrand = null as any;
    component.onHoldingSelectedForBrand({ id: 'h3' } as any);
    expect(component.selectedBrand).toBeNull();
  });

  it('falls back to default error messages when backend message missing', () => {
    serviceSpy.deleteDoors.and.returnValue(throwError(() => ({}) as any));
    component.selectedDoors = { id: 'd1', quantity: 4 } as any;
    component.deleteDoors();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.createHolding.and.returnValue(throwError(() => ({}) as any));
    component.holdingForm.patchValue({ name: 'H', logo: 'L', founding: 1970 });
    component.createHolding();
    expect(component.errorMessageCreate).toBe('Failed to create holding.');

    serviceSpy.updateColor.and.returnValue(throwError(() => ({}) as any));
    component.selectedColor = {
      id: 'c1',
      name: 'Red',
      hexCode: '#ff0000',
    } as any;
    component.colorUpdateForm.patchValue({ name: 'Blue', hexCode: '#0000ff' });
    component.updateColor();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.deleteColor.and.returnValue(throwError(() => ({}) as any));
    component.selectedColor = {
      id: 'c1',
      name: 'Red',
      hexCode: '#ff0000',
    } as any;
    component.deleteColor();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.createColor.and.returnValue(throwError(() => ({}) as any));
    component.colorForm.patchValue({ name: 'Any', hexCode: '#123456' });
    component.createColor();
    expect(component.errorMessageCreate).toBe('Default error message');

    serviceSpy.updateDoors.and.returnValue(throwError(() => ({}) as any));
    component.selectedDoors = { id: 'd1', quantity: 4 } as any;
    component.doorsUpdateForm.patchValue({ quantity: 3 });
    component.updateDoors();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.createDoors.and.returnValue(throwError(() => ({}) as any));
    component.doorsForm.patchValue({ quantity: 2 });
    component.createDoors();
    expect(component.errorMessageCreate).toBe('Default error message');

    serviceSpy.updateEngine.and.returnValue(throwError(() => ({}) as any));
    component.selectedEngine = { id: 'e1', engineType: 'V8' } as any;
    component.engineUpdateForm.patchValue({ engineType: 'V6' });
    component.updateEngine();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.deleteEngine.and.returnValue(throwError(() => ({}) as any));
    component.selectedEngine = { id: 'e1', engineType: 'V8' } as any;
    component.deleteEngine();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.createEngine.and.returnValue(throwError(() => ({}) as any));
    component.engineForm.patchValue({ engineType: 'V12' });
    component.createEngine();
    expect(component.errorMessageCreate).toBe('Default error message');

    serviceSpy.updateFuel.and.returnValue(throwError(() => ({}) as any));
    component.selectedFuel = { id: 'f1', fuelType: 'Gas' } as any;
    component.fuelUpdateForm.patchValue({ fuelType: 'Diesel' });
    component.updateFuel();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.deleteFuel.and.returnValue(throwError(() => ({}) as any));
    component.selectedFuel = { id: 'f1', fuelType: 'Gas' } as any;
    component.deleteFuel();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.createFuel.and.returnValue(throwError(() => ({}) as any));
    component.fuelForm.patchValue({ fuelType: 'Hydrogen' });
    component.createFuel();
    expect(component.errorMessageCreate).toBe('Default error message');

    serviceSpy.updateHolding.and.returnValue(throwError(() => ({}) as any));
    component.selectedHolding = {
      id: 'h1',
      name: 'Hold',
      logo: '',
      founding: 1990,
    } as any;
    component.holdingUpdateForm.patchValue({
      name: 'Hold2',
      logo: 'L',
      founding: 2000,
    });
    component.updateHolding();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.deleteHolding.and.returnValue(throwError(() => ({}) as any));
    component.selectedHolding = {
      id: 'h1',
      name: 'Hold',
      logo: '',
      founding: 1990,
    } as any;
    component.deleteHolding();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.updateSeats.and.returnValue(throwError(() => ({}) as any));
    component.selectedSeats = { id: 's1', quantity: 5 } as any;
    component.seatsUpdateForm.patchValue({ quantity: 4 });
    component.updateSeats();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.deleteSeats.and.returnValue(throwError(() => ({}) as any));
    component.selectedSeats = { id: 's1', quantity: 5 } as any;
    component.deleteSeats();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.createSeats.and.returnValue(throwError(() => ({}) as any));
    component.seatsForm.patchValue({ quantity: 4 });
    component.createSeats();
    expect(component.errorMessageCreate).toBe('Default error message');

    serviceSpy.updateType.and.returnValue(throwError(() => ({}) as any));
    component.selectedType = { id: 't1', type: 'SUV' } as any;
    component.typeUpdateForm.patchValue({ type: 'Coupe' });
    component.updateType();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.deleteType.and.returnValue(throwError(() => ({}) as any));
    component.selectedType = { id: 't1', type: 'SUV' } as any;
    component.deleteType();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.createType.and.returnValue(throwError(() => ({}) as any));
    component.typeForm.patchValue({ type: 'Truck' });
    component.createType();
    expect(component.errorMessageCreate).toBe('Default error message');

    serviceSpy.updateBrand.and.returnValue(throwError(() => ({}) as any));
    component.selectedBrand = {
      id: 'b1',
      name: 'Brand',
      logo: '',
      founding: 2000,
      holdingId: 'h1',
    } as any;
    component.brandUpdateForm.patchValue({
      name: 'B2',
      logo: 'L',
      founding: 2001,
      holdingId: 'h1',
    });
    component.updateBrand();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.deleteBrand.and.returnValue(throwError(() => ({}) as any));
    component.selectedBrand = {
      id: 'b1',
      name: 'Brand',
      logo: '',
      founding: 2000,
      holdingId: 'h1',
    } as any;
    component.deleteBrand();
    expect(component.errorMessageUpdate).toBe('Default error message');

    serviceSpy.createBrand.and.returnValue(throwError(() => ({}) as any));
    component.brandForm.patchValue({
      name: 'New',
      logo: 'L',
      founding: 1999,
      holdingId: 'h1',
    });
    component.createBrand();
    expect(component.errorMessageCreate).toBe('Failed to create brand.');
  });

  it('manages doors, engine, fuel, holding, seats, type and brand flows', () => {
    // Doors
    component.doors = [{ id: 'd1', quantity: 4 } as any];
    component.searchedDoorsName = '4';
    component.fetchDoorsByName();
    component.doorsUpdateForm.patchValue({ quantity: 2 });
    component.updateDoors();
    component.doorsForm.patchValue({ quantity: 2 });
    component.createDoors();
    component.deleteDoors('d1');
    expect(serviceSpy.updateDoors).toHaveBeenCalled();
    expect(serviceSpy.createDoors).toHaveBeenCalled();
    expect(serviceSpy.deleteDoors).toHaveBeenCalledWith('d1');

    // Engine
    component.engines = [{ id: 'e1', engineType: 'V8' } as any];
    component.searchedEngineName = 'v8';
    component.fetchEngineByName();
    component.engineUpdateForm.patchValue({ engineType: 'V6' });
    component.updateEngine();
    component.engineForm.patchValue({ engineType: 'V12' });
    component.createEngine();
    component.deleteEngine('e1');

    // Fuel
    component.fuels = [{ id: 'f1', fuelType: 'Gas' } as any];
    component.searchedFuelName = 'gas';
    component.fetchFuelByName();
    component.fuelUpdateForm.patchValue({ fuelType: 'Diesel' });
    component.updateFuel();
    component.fuelForm.patchValue({ fuelType: 'Hydrogen' });
    component.createFuel();
    component.deleteFuel('f1');

    // Holding
    component.holdings = [
      { id: 'h1', name: 'Hold', logo: '', founding: 1990 } as any,
    ];
    component.searchedHoldingName = 'hold';
    component.fetchHoldingByName();
    component.holdingUpdateForm.patchValue({
      name: 'Hold2',
      logo: 'L',
      founding: 2000,
    });
    component.updateHolding();
    component.holdingForm.patchValue({
      name: 'New',
      logo: 'N',
      founding: 1975,
    });
    component.createHolding();
    component.deleteHolding('h1');

    // Seats
    component.seats = [{ id: 's1', quantity: 5 } as any];
    component.searchedSeatsName = '5';
    component.fetchSeatsByName();
    component.seatsUpdateForm.patchValue({ quantity: 6 });
    component.updateSeats();
    component.seatsForm.patchValue({ quantity: 4 });
    component.createSeats();
    component.deleteSeats('s1');

    // Type
    component.types = [{ id: 't1', type: 'SUV' } as any];
    component.searchedTypeName = 'suv';
    component.fetchTypeByName();
    component.typeUpdateForm.patchValue({ type: 'Coupe' });
    component.updateType();
    component.typeForm.patchValue({ type: 'Truck' });
    component.createType();
    component.deleteType('t1');

    // Brand
    component.brands = [
      {
        id: 'b1',
        name: 'Brand',
        logo: 'logo',
        founding: 2000,
        holdingId: 'h1',
      } as any,
    ];
    component.searchedBrandName = 'brand';
    component.fetchBrandByName();
    component.brandUpdateForm.patchValue({
      name: 'Brand2',
      logo: 'logo2',
      founding: 2001,
      holdingId: 'h1',
    });
    component.updateBrand();
    component.brandForm.patchValue({
      name: 'NewBrand',
      logo: 'logo',
      founding: 1999,
      holdingId: 'h1',
    });
    component.createBrand();
    component.deleteBrand('b1');

    expect(serviceSpy.updateEngine).toHaveBeenCalled();
    expect(serviceSpy.createFuel).toHaveBeenCalled();
    expect(serviceSpy.updateHolding).toHaveBeenCalled();
    expect(serviceSpy.createSeats).toHaveBeenCalled();
    expect(serviceSpy.createType).toHaveBeenCalled();
    expect(serviceSpy.updateBrand).toHaveBeenCalled();
  });
});
