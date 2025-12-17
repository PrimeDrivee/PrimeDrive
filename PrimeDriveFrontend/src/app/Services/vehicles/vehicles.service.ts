import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vehicle } from '../../Models/vehicles/vehicle.interface';
import { Brand } from '../../Models/vehicles/brand.interface';
import { Type as VehicleType } from '../../Models/vehicles/type.interface';
import { Color } from '../../Models/vehicles/color.interface';
import { Specs } from '../../Models/vehicles/specs.interface';
import { Engine } from '../../Models/vehicles/engine.interface';
import { Fuel } from '../../Models/vehicles/fuel.interface';
import { Doors } from '../../Models/vehicles/doors.interface';
import { Seats } from '../../Models/vehicles/seats.interface';
import { User } from '../../Models/vehicles/user.interface';
import { Holding } from '../../Models/vehicles/holding.interface';

/**
 * Service for accessing vehicle-related data from the backend API.
 * Provides methods for retrieving vehicles, brands, types, specs, colors, and associated metadata.
 *
 * Author: Fatlum Epiroti
 * Version: 2.0.0
 * Date: 2025-06-04
 */
@Injectable({
  providedIn: 'root',
})
export class VehiclesService {
  private apiUrl = 'https://localhost:8443/api';
  private httpClient = inject(HttpClient);

  /**
   * Retrieves a list of all vehicles from the backend.
   * @returns Observable of Vehicle array.
   */
  public getVehicles(): Observable<Vehicle[]> {
    return this.httpClient.get<Vehicle[]>(`${this.apiUrl}/vehicle`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a vehicle by its unique identifier.
   * @param id - The UUID of the vehicle.
   * @returns Observable of the Vehicle.
   */
  public getVehicleById(id: string): Observable<Vehicle> {
    return this.httpClient.get<Vehicle>(`${this.apiUrl}/vehicle/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Creates a new vehicle entry.
   * @param vehicle - The vehicle data to be created.
   * @returns Observable of the created Vehicle.
   */
  public createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.httpClient.post<Vehicle>(`${this.apiUrl}/vehicle`, vehicle, {
      withCredentials: true,
    });
  }

  /**
   * Updates an existing vehicle entry.
   * @param vehicle - The vehicle data to be updated.
   * @returns Observable of the updated Vehicle.
   */
  public updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.httpClient.put<Vehicle>(`${this.apiUrl}/vehicle/${vehicle.id}`, vehicle, {
      withCredentials: true,
    });
  }

  /**
   * Deletes a vehicle by its unique identifier.
   * @param id - The UUID of the vehicle to delete.
   * @returns Observable of void.
   */
  public deleteVehicle(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vehicle/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves the brand details for a given brand ID.
   * @param id - The UUID of the brand.
   * @returns Observable of the Brand.
   */
  public getBrandById(id: string): Observable<Brand> {
    return this.httpClient.get<Brand>(`${this.apiUrl}/vehicle_brands/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a list of all vehicle brands.
   * @returns Observable of Brand array.
   */
  public getBrands(): Observable<Brand[]> {
    return this.httpClient.get<Brand[]>(`${this.apiUrl}/vehicle_brands`, {
      withCredentials: true,
    });
  }

  /**
   * Creates a new brand entry.
   * @param brand - The brand data to be created.
   * @returns Observable of the created Brand.
   */
  public createBrand(brand: Brand): Observable<Brand> {
    return this.httpClient.post<Brand>(`${this.apiUrl}/vehicle_brands`, brand, {
      withCredentials: true,
    });
  }

  /**
   * Updates an existing brand entry.
   * @param brand - The brand data to be updated.
   * @returns Observable of the updated Brand.
   */
  public updateBrand(brand: Brand): Observable<Brand> {
    console.log('Updating brand:', brand);
    return this.httpClient.put<Brand>(`${this.apiUrl}/vehicle_brands/${brand.id}`, brand, {
      withCredentials: true,
    });
  }

  /**
   * Deletes a brand by its unique identifier.
   * @param id - The UUID of the brand to delete.
   * @returns Observable of void.
   */
  public deleteBrand(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vehicle_brands/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a list of all vehicle holdings.
   * @returns Observable of Holding array.
   */
  public getHoldingById(id: string): Observable<Holding[]> {
    return this.httpClient.get<Holding[]>(`${this.apiUrl}/vehicle_holdings/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a list of all vehicle holdings.
   * @returns Observable of Brand array.
   */
  public getHoldings(): Observable<Holding[]> {
    return this.httpClient.get<Holding[]>(`${this.apiUrl}/vehicle_holdings`, {
      withCredentials: true,
    });
  }

  /**
   * Creates a new holding entry.
   * @param holding - The holding data to be created.
   * @returns Observable of the created Holding.
   */
  public createHolding(holding: Holding): Observable<Holding> {
    console.log('Creating holding:', holding);
    return this.httpClient.post<Holding>(`${this.apiUrl}/vehicle_holdings`, holding, {
      withCredentials: true,
    });
  }

  /**
   * Updates an existing holding entry.
   * @param holding - The holding data to be updated.
   * @returns Observable of the updated Holding.
   */
  public updateHolding(holding: Holding): Observable<Holding> {
    return this.httpClient.put<Holding>(`${this.apiUrl}/vehicle_holdings/${holding.id}`, holding, {
      withCredentials: true,
    });
  }

  /**
   * Deletes a holding by its unique identifier.
   * @param id - The UUID of the holding to delete.
   * @returns Observable of void.
   */
  public deleteHolding(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vehicle_holdings/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves the vehicle type details by type ID.
   * @param id - The UUID of the vehicle type.
   * @returns Observable of the VehicleType.
   */
  public getTypeById(id: string): Observable<VehicleType> {
    return this.httpClient.get<VehicleType>(`${this.apiUrl}/vehicle_types/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a list of all vehicle types.
   * @returns Observable of VehicleType array.
   */
  public getTypes(): Observable<VehicleType[]> {
    return this.httpClient.get<VehicleType[]>(`${this.apiUrl}/vehicle_types`, {
      withCredentials: true,
    });
  }

  /**
   * Creates a new vehicle type entry.
   * @param type - The vehicle type data to be created.
   * @returns Observable of the created VehicleType.
   */
  public createType(type: VehicleType): Observable<VehicleType> {
    return this.httpClient.post<VehicleType>(`${this.apiUrl}/vehicle_types`, type, {
      withCredentials: true,
    });
  }

  /**
   * Updates an existing vehicle type entry.
   * @param type - The vehicle type data to be updated.
   * @returns Observable of the updated VehicleType.
   */
  public updateType(type: VehicleType): Observable<VehicleType> {
    return this.httpClient.put<VehicleType>(`${this.apiUrl}/vehicle_types/${type.id}`, type, {
      withCredentials: true,
    });
  }

  /**
   * Deletes a vehicle type by its unique identifier.
   * @param id - The UUID of the vehicle type to delete.
   * @returns Observable of void.
   */
  public deleteType(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vehicle_types/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves the vehicle color details by color ID.
   * @param id - The UUID of the vehicle color.
   * @returns Observable of the Color.
   */
  public getColorById(id: string): Observable<Color> {
    return this.httpClient.get<Color>(`${this.apiUrl}/vehicle_colors/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a list of all vehicle colors.
   * @returns Observable of Color array.
   */
  public getColors(): Observable<Color[]> {
    return this.httpClient.get<Color[]>(`${this.apiUrl}/vehicle_colors`, {
      withCredentials: true,
    });
  }

  /**
   * Creates a new vehicle color entry.
   * @param color - The color data to be created.
   * @returns Observable of the created Color.
   */
  public createColor(color: Color): Observable<Color> {
    return this.httpClient.post<Color>(`${this.apiUrl}/vehicle_colors`, color, {
      withCredentials: true,
    });
  }

  /**
   * Updates an existing vehicle color entry.
   * @param color - The color data to be updated.
   * @returns Observable of the updated Color.
   */
  public updateColor(color: Color): Observable<Color> {
    return this.httpClient.put<Color>(`${this.apiUrl}/vehicle_colors/${color.id}`, color, {
      withCredentials: true,
    });
  }

  /**
   * Deletes a vehicle color by its unique identifier.
   * @param id - The UUID of the color to delete.
   * @returns Observable of void.
   */
  public deleteColor(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vehicle_colors/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves the technical specifications for a vehicle.
   * @param id - The UUID of the vehicle specs.
   * @returns Observable of the Specs.
   */
  public getSpecsById(id: string): Observable<Specs> {
    return this.httpClient.get<Specs>(`${this.apiUrl}/vehicle_specs/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a list of all vehicle specs.
   * @returns Observable of Specs array.
   */
  public getSpecs(): Observable<Specs[]> {
    return this.httpClient.get<Specs[]>(`${this.apiUrl}/vehicle_specs`, {
      withCredentials: true,
    });
  }

  /**
   * Creates a new vehicle specs entry.
   * @param specs - The specs data to be created.
   * @returns Observable of the created Specs.
   */
  public createSpecs(specs: Specs): Observable<Specs> {
    console.log('Creating specs:', specs);
    return this.httpClient.post<Specs>(`${this.apiUrl}/vehicle_specs`, specs, {
      withCredentials: true,
    });
  }

  /**
   * Updates an existing vehicle specs entry.
   * @param specs - The specs data to be updated.
   * @returns Observable of the updated Specs.
   */
  public updateSpecs(specs: Specs): Observable<Specs> {
    return this.httpClient.put<Specs>(`${this.apiUrl}/vehicle_specs/${specs.id}`, specs, {
      withCredentials: true,
    });
  }

  /**
   * Deletes vehicle specs by its unique identifier.
   * @param id - The UUID of the specs to delete.
   * @returns Observable of void.
   */
  public deleteSpecs(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vehicle_specs/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves the engine configuration for a vehicle.
   * @param id - The UUID of the engine.
   * @returns Observable of the Engine.
   */
  public getEngineById(id: string): Observable<Engine> {
    return this.httpClient.get<Engine>(`${this.apiUrl}/vehicle_engine/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a list of all vehicle engines.
   * @returns Observable of Engine array.
   */
  public getEngines(): Observable<Engine[]> {
    return this.httpClient.get<Engine[]>(`${this.apiUrl}/vehicle_engine`, {
      withCredentials: true,
    });
  }

  /**
   * Creates a new vehicle engine entry.
   * @param engine - The engine data to be created.
   * @returns Observable of the created Engine.
   */
  public createEngine(engine: Engine): Observable<Engine> {
    return this.httpClient.post<Engine>(`${this.apiUrl}/vehicle_engine`, engine, {
      withCredentials: true,
    });
  }

  /**
   * Updates an existing vehicle engine entry.
   * @param engine - The engine data to be updated.
   * @returns Observable of the updated Engine.
   */
  public updateEngine(engine: Engine): Observable<Engine> {
    return this.httpClient.put<Engine>(`${this.apiUrl}/vehicle_engine/${engine.id}`, engine, {
      withCredentials: true,
    });
  }

  /**
   * Deletes a vehicle engine by its unique identifier.
   * @param id - The UUID of the engine to delete.
   * @returns Observable of void.
   */
  public deleteEngine(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vehicle_engine/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves the fuel type configuration for a vehicle.
   * @param id - The UUID of the fuel.
   * @returns Observable of the Fuel.
   */
  public getFuelById(id: string): Observable<Fuel> {
    return this.httpClient.get<Fuel>(`${this.apiUrl}/vehicle_fuels/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a list of all vehicle fuels.
   * @returns Observable of Fuel array.
   */
  public getFuels(): Observable<Fuel[]> {
    return this.httpClient.get<Fuel[]>(`${this.apiUrl}/vehicle_fuels`, {
      withCredentials: true,
    });
  }

  /**
   * Creates a new vehicle fuel entry.
   * @param fuel - The fuel data to be created.
   * @returns Observable of the created Fuel.
   */
  public createFuel(fuel: Fuel): Observable<Fuel> {
    return this.httpClient.post<Fuel>(`${this.apiUrl}/vehicle_fuels`, fuel, {
      withCredentials: true,
    });
  }

  /**
   * Updates an existing vehicle fuel entry.
   * @param fuel - The fuel data to be updated.
   * @returns Observable of the updated Fuel.
   */
  public updateFuel(fuel: Fuel): Observable<Fuel> {
    return this.httpClient.put<Fuel>(`${this.apiUrl}/vehicle_fuels/${fuel.id}`, fuel, {
      withCredentials: true,
    });
  }

  /**
   * Deletes a vehicle fuel by its unique identifier.
   * @param id - The UUID of the fuel to delete.
   * @returns Observable of void.
   */
  public deleteFuel(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vehicle_fuels/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves the door configuration for a vehicle.
   * @param id - The UUID of the doors.
   * @returns Observable of the Doors.
   */
  public getDoorsById(id: string): Observable<Doors> {
    return this.httpClient.get<Doors>(`${this.apiUrl}/vehicle_doors/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a list of all vehicle doors.
   * @returns Observable of Doors array.
   */
  public getDoors(): Observable<Doors[]> {
    return this.httpClient.get<Doors[]>(`${this.apiUrl}/vehicle_doors`, {
      withCredentials: true,
    });
  }

  /**
   * Creates a new vehicle doors entry.
   * @param doors - The doors data to be created.
   * @returns Observable of the created Doors.
   */
  public createDoors(doors: Doors): Observable<Doors> {
    return this.httpClient.post<Doors>(`${this.apiUrl}/vehicle_doors`, doors, {
      withCredentials: true,
    });
  }

  /**
   * Updates an existing vehicle doors entry.
   * @param doors - The doors data to be updated.
   * @returns Observable of the updated Doors.
   */
  public updateDoors(doors: Doors): Observable<Doors> {
    return this.httpClient.put<Doors>(`${this.apiUrl}/vehicle_doors/${doors.id}`, doors, {
      withCredentials: true,
    });
  }

  /**
   * Deletes vehicle doors by its unique identifier.
   * @param id - The UUID of the doors to delete.
   * @returns Observable of void.
   */
  public deleteDoors(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vehicle_doors/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves the seating configuration for a vehicle.
   * @param id - The UUID of the seats.
   * @returns Observable of the Seats.
   */
  public getSeatsById(id: string): Observable<Seats> {
    return this.httpClient.get<Seats>(`${this.apiUrl}/vehicle_seats/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a list of all vehicle seats.
   * @returns Observable of Seats array.
   */
  public getSeats(): Observable<Seats[]> {
    return this.httpClient.get<Seats[]>(`${this.apiUrl}/vehicle_seats`, {
      withCredentials: true,
    });
  }

  /**
   * Creates a new vehicle seats entry.
   * @param seats - The seats data to be created.
   * @returns Observable of the created Seats.
   */
  public createSeats(seats: Seats): Observable<Seats> {
    return this.httpClient.post<Seats>(`${this.apiUrl}/vehicle_seats`, seats, {
      withCredentials: true,
    });
  }

  /**
   * Updates an existing vehicle seats entry.
   * @param seats - The seats data to be updated.
   * @returns Observable of the updated Seats.
   */
  public updateSeats(seats: Seats): Observable<Seats> {
    return this.httpClient.put<Seats>(`${this.apiUrl}/vehicle_seats/${seats.id}`, seats, {
      withCredentials: true,
    });
  }

  /**
   * Deletes vehicle seats by its unique identifier.
   * @param id - The UUID of the seats to delete.
   * @returns Observable of void.
   */
  public deleteSeats(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/vehicle_seats/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves user data by user ID.
   * @param id - The UUID of the user.
   * @returns Observable of the User.
   */
  public getUserById(id: string): Observable<User> {
    return this.httpClient.get<User>(`${this.apiUrl}/users/${id}`, {
      withCredentials: true,
    });
  }
}
