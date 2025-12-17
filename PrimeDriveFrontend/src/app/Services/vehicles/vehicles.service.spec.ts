import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from '../../Models/vehicles/vehicle.interface';
import { Brand } from '../../Models/vehicles/brand.interface';
import { Color } from '../../Models/vehicles/color.interface';
import { Specs } from '../../Models/vehicles/specs.interface';

const api = 'https://localhost:8443/api';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(VehiclesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets vehicles list', () => {
    const vehicles: Vehicle[] = [{ id: '1' } as Vehicle];
    let result: Vehicle[] = [];

    service.getVehicles().subscribe((v) => (result = v));
    const req = http.expectOne(`${api}/vehicle`);
    expect(req.request.method).toBe('GET');
    req.flush(vehicles);
    expect(result).toEqual(vehicles);
  });

  it('creates and deletes a vehicle', () => {
    const vehicle = {
      id: '1',
      brandsId: 'b1',
      specsId: 's1',
      typesId: 't1',
    } as Vehicle;

    service.createVehicle(vehicle).subscribe();
    const createReq = http.expectOne(`${api}/vehicle`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(vehicle);

    service.deleteVehicle(vehicle.id!).subscribe();
    const deleteReq = http.expectOne(`${api}/vehicle/${vehicle.id}`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});
  });

  it('updates vehicles and handles brands/colors/specs lists and user lookup', () => {
    const vehicle = { id: 'v1' } as Vehicle;
    service.updateVehicle(vehicle).subscribe();
    const updateReq = http.expectOne(`${api}/vehicle/${vehicle.id}`);
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush(vehicle);

    service.getBrands().subscribe();
    const brandsReq = http.expectOne(`${api}/vehicle_brands`);
    expect(brandsReq.request.method).toBe('GET');
    brandsReq.flush([]);

    service.createBrand({ id: 'b1' } as Brand).subscribe();
    const createBrandReq = http.expectOne(`${api}/vehicle_brands`);
    expect(createBrandReq.request.method).toBe('POST');
    createBrandReq.flush({});

    service.deleteBrand('b1').subscribe();
    const deleteBrandReq = http.expectOne(`${api}/vehicle_brands/b1`);
    expect(deleteBrandReq.request.method).toBe('DELETE');
    deleteBrandReq.flush({});

    service.getColors().subscribe();
    const colorsReq = http.expectOne(`${api}/vehicle_colors`);
    expect(colorsReq.request.method).toBe('GET');
    colorsReq.flush([]);

    service.createColor({ id: 'c1' } as Color).subscribe();
    const createColorReq = http.expectOne(`${api}/vehicle_colors`);
    expect(createColorReq.request.method).toBe('POST');
    createColorReq.flush({});

    service.deleteColor('c1').subscribe();
    const deleteColorReq = http.expectOne(`${api}/vehicle_colors/c1`);
    expect(deleteColorReq.request.method).toBe('DELETE');
    deleteColorReq.flush({});

    service.getSpecs().subscribe();
    const specsReq = http.expectOne(`${api}/vehicle_specs`);
    expect(specsReq.request.method).toBe('GET');
    specsReq.flush([]);

    service.getUserById('u1').subscribe();
    const userReq = http.expectOne(`${api}/users/u1`);
    expect(userReq.request.method).toBe('GET');
    userReq.flush({ id: 'u1' });
  });

  it('gets related metadata (brand/color/specs)', () => {
    let calls = 0;
    service.getBrandById('b1').subscribe(() => calls++);
    http.expectOne(`${api}/vehicle_brands/b1`).flush({} as Brand);

    service.getColorById('c1').subscribe(() => calls++);
    http.expectOne(`${api}/vehicle_colors/c1`).flush({} as Color);

    service.getSpecsById('s1').subscribe(() => calls++);
    http.expectOne(`${api}/vehicle_specs/s1`).flush({} as Specs);

    expect(calls).toBe(3);
  });

  it('updates existing entities', () => {
    const brand = {
      id: 'b1',
      name: 'Brand',
      logo: '',
      holdingId: '',
      founding: 2000,
    } as Brand;
    service.updateBrand(brand).subscribe();
    const brandReq = http.expectOne(`${api}/vehicle_brands/${brand.id}`);
    expect(brandReq.request.method).toBe('PUT');
    brandReq.flush(brand);

    const color = { id: 'c1', name: 'Red', hexCode: '#ff0000' } as Color;
    service.updateColor(color).subscribe();
    const colorReq = http.expectOne(`${api}/vehicle_colors/${color.id}`);
    expect(colorReq.request.method).toBe('PUT');
    colorReq.flush(color);
  });

  it('performs CRUD across specs, engine, fuel, doors, seats, holdings, types', () => {
    const collected: Record<string, any> = {
      specs: null,
      engine: null,
      fuel: null,
      doors: null,
      seats: null,
      holding: null,
      type: null,
    };
    const specs = {
      id: 's1',
      engineId: 'e1',
      fuelsId: 'f1',
      doorsId: 'd1',
      seatsId: 'se1',
    } as Specs;
    service.createSpecs(specs).subscribe((body) => (collected['specs'] = body));
    http.expectOne(`${api}/vehicle_specs`).flush(specs);

    service.updateSpecs(specs).subscribe((body) => (collected['specs'] = body));
    http
      .expectOne(`${api}/vehicle_specs/${specs.id}`)
      .flush({ ...specs, powerKw: 1 } as Specs);

    service.deleteSpecs(specs.id).subscribe();
    http.expectOne(`${api}/vehicle_specs/${specs.id}`).flush({});

    const engine = { id: 'e1', engineType: 'V8' } as any;
    service
      .getEngineById(engine.id)
      .subscribe((body) => (collected['engine'] = body));
    http.expectOne(`${api}/vehicle_engine/${engine.id}`).flush(engine);
    service.getEngines().subscribe((body) => (collected['engine'] = body));
    http.expectOne(`${api}/vehicle_engine`).flush([engine]);
    service
      .createEngine(engine)
      .subscribe((body) => (collected['engine'] = body));
    http.expectOne(`${api}/vehicle_engine`).flush(engine);
    service
      .updateEngine(engine)
      .subscribe((body) => (collected['engine'] = body));
    http.expectOne(`${api}/vehicle_engine/${engine.id}`).flush(engine);
    service.deleteEngine(engine.id).subscribe();
    http.expectOne(`${api}/vehicle_engine/${engine.id}`).flush({});

    const fuel = { id: 'f1', fuelType: 'Gas' } as any;
    service
      .getFuelById(fuel.id)
      .subscribe((body) => (collected['fuel'] = body));
    http.expectOne(`${api}/vehicle_fuels/${fuel.id}`).flush(fuel);
    service.getFuels().subscribe((body) => (collected['fuel'] = body));
    http.expectOne(`${api}/vehicle_fuels`).flush([fuel]);
    service.createFuel(fuel).subscribe((body) => (collected['fuel'] = body));
    http.expectOne(`${api}/vehicle_fuels`).flush(fuel);
    service.updateFuel(fuel).subscribe((body) => (collected['fuel'] = body));
    http.expectOne(`${api}/vehicle_fuels/${fuel.id}`).flush(fuel);
    service.deleteFuel(fuel.id).subscribe();
    http.expectOne(`${api}/vehicle_fuels/${fuel.id}`).flush({});

    const doors = { id: 'd1', quantity: 4 } as any;
    service
      .getDoorsById(doors.id)
      .subscribe((body) => (collected['doors'] = body));
    http.expectOne(`${api}/vehicle_doors/${doors.id}`).flush(doors);
    service.getDoors().subscribe((body) => (collected['doors'] = body));
    http.expectOne(`${api}/vehicle_doors`).flush([doors]);
    service.createDoors(doors).subscribe((body) => (collected['doors'] = body));
    http.expectOne(`${api}/vehicle_doors`).flush(doors);
    service.updateDoors(doors).subscribe((body) => (collected['doors'] = body));
    http.expectOne(`${api}/vehicle_doors/${doors.id}`).flush(doors);
    service.deleteDoors(doors.id).subscribe();
    http.expectOne(`${api}/vehicle_doors/${doors.id}`).flush({});

    const seats = { id: 'se1', quantity: 5 } as any;
    service
      .getSeatsById(seats.id)
      .subscribe((body) => (collected['seats'] = body));
    http.expectOne(`${api}/vehicle_seats/${seats.id}`).flush(seats);
    service.getSeats().subscribe((body) => (collected['seats'] = body));
    http.expectOne(`${api}/vehicle_seats`).flush([seats]);
    service.createSeats(seats).subscribe((body) => (collected['seats'] = body));
    http.expectOne(`${api}/vehicle_seats`).flush(seats);
    service.updateSeats(seats).subscribe((body) => (collected['seats'] = body));
    http.expectOne(`${api}/vehicle_seats/${seats.id}`).flush(seats);
    service.deleteSeats(seats.id).subscribe();
    http.expectOne(`${api}/vehicle_seats/${seats.id}`).flush({});

    const holding = { id: 'h1', name: 'Hold', logo: '', founding: 1990 } as any;
    service
      .getHoldingById(holding.id)
      .subscribe((body) => (collected['holding'] = body));
    http.expectOne(`${api}/vehicle_holdings/${holding.id}`).flush([holding]);
    service.getHoldings().subscribe((body) => (collected['holding'] = body));
    http.expectOne(`${api}/vehicle_holdings`).flush([holding]);
    service
      .createHolding(holding)
      .subscribe((body) => (collected['holding'] = body));
    http.expectOne(`${api}/vehicle_holdings`).flush(holding);
    service
      .updateHolding(holding)
      .subscribe((body) => (collected['holding'] = body));
    http.expectOne(`${api}/vehicle_holdings/${holding.id}`).flush(holding);
    service.deleteHolding(holding.id).subscribe();
    http.expectOne(`${api}/vehicle_holdings/${holding.id}`).flush({});

    const type = { id: 't1', type: 'SUV', name: 'Type' } as any;
    service.getTypes().subscribe((body) => (collected['type'] = body));
    http.expectOne(`${api}/vehicle_types`).flush([type]);
    service.createType(type).subscribe((body) => (collected['type'] = body));
    http.expectOne(`${api}/vehicle_types`).flush(type);
    service.updateType(type).subscribe((body) => (collected['type'] = body));
    http.expectOne(`${api}/vehicle_types/${type.id}`).flush(type);
    service.deleteType(type.id).subscribe();
    http.expectOne(`${api}/vehicle_types/${type.id}`).flush({});

    expect(collected['specs']).toEqual(jasmine.objectContaining({ id: 's1' }));
    expect(collected['engine']).toBeTruthy();
    expect(collected['fuel']).toBeTruthy();
    expect(collected['doors']).toBeTruthy();
    expect(collected['seats']).toBeTruthy();
    expect(collected['holding']).toBeTruthy();
    expect(collected['type']).toBeTruthy();
  });
});
