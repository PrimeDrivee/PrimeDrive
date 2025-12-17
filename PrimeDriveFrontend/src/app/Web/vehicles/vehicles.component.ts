/**
 * Component that displays a list of vehicles with filter functionality.
 * Retrieves all vehicles and their nested details (brand, type, specs, etc.).
 * Supports dynamic filtering, reset, and navigation to individual vehicle details.
 *
 * Author: Fatlum Epiroti
 * Version: 1.0.0
 * Date: 2025-06-06
 */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Vehicle } from '../../Models/vehicles/vehicle.interface';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { forkJoin, map, switchMap, of } from 'rxjs';
import { VehicleWithLessDetails } from '../../Models/vehicles/vehicleWithLessDetails';
import { VehiclesService } from '../../Services/vehicles/vehicles.service';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    MatInput,
    MatLabel,
    MatIcon,
    MatButtonModule,
  ],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss',
})
export class VehiclesComponent implements OnInit {
  public filtersExpanded = true;
  public vehicles: VehicleWithLessDetails[] = [];
  public filters = {
    brand: 'All',
    type: 'All',
    year: null as number | null,
    maxPrice: null as number | null,
    maxMileage: null as number | null,
    condition: 'All',
    holding: 'All',
    color: 'All',
    engine: 'All',
    fuel: 'All',
    seats: 'All' as number | string,
    doors: 'All' as number | string,
  };

  public uniqueBrands: string[] = [];
  public uniqueTypes: string[] = [];
  public uniqueConditions: string[] = [];

  public uniqueHoldings: string[] = [];
  public uniqueColors: string[] = [];
  public uniqueEngines: string[] = [];
  public uniqueFuels: string[] = [];
  public uniqueSeats: (number | string)[] = [];
  public uniqueDoors: (number | string)[] = [];

  private vehiclesService = inject(VehiclesService);
  private router = inject(Router);

  /**
   * Lifecycle hook that is called after component initialization.
   * Triggers the loading of all vehicles from the backend.
   *
   * @returns void
   */
  public ngOnInit(): void {
    this.getVehicles();
  }

  /**
   * Navigates to the detailed view of a selected vehicle.
   *
   * @param vehicleId The ID of the selected vehicle.
   * @returns void
   */
  public goToVehicleDetails(vehicleId: string): void {
    this.router.navigate(['/vehicles', vehicleId]);
  }

  /**
   * Loads all vehicles from the backend and maps related entities
   * such as brand, type, color, specs, engine, fuel, seats, and doors.
   * Also computes unique values for filter dropdowns.
   *
   * @returns void
   */
  private getVehicles() {
    this.vehiclesService
      .getVehicles()
      .pipe(
        switchMap((vehicles: Vehicle[]) => {
          const detailedVehicles$ = vehicles.map((vehicle: Vehicle) =>
            this.vehiclesService.getBrandById(vehicle.brandsId).pipe(
              switchMap((brand) =>
                forkJoin({
                  type: this.vehiclesService.getTypeById(vehicle.typesId),
                  color: vehicle.colorsId
                    ? this.vehiclesService.getColorById(vehicle.colorsId)
                    : of(null),
                  specs: this.vehiclesService.getSpecsById(vehicle.specsId).pipe(
                    switchMap((specs) =>
                      forkJoin({
                        doors: this.vehiclesService.getDoorsById(specs.doorsId),
                        engine: this.vehiclesService.getEngineById(specs.engineId),
                        fuels: this.vehiclesService.getFuelById(specs.fuelsId),
                        seats: this.vehiclesService.getSeatsById(specs.seatsId),
                      }).pipe(
                        map((details) => ({
                          ...specs,
                          doors: details.doors,
                          engine: details.engine,
                          fuels: details.fuels,
                          seats: details.seats,
                        }))
                      )
                    )
                  ),
                  holding: this.vehiclesService.getHoldingById(brand.holdingId),
                }).pipe(
                  map(
                    (details) =>
                      ({
                        ...vehicle,
                        brand: brand,
                        type: details.type,
                        color: details.color,
                        specs: details.specs,
                        holding: details.holding,
                      }) as unknown as VehicleWithLessDetails
                  )
                )
              )
            )
          );
          return forkJoin(detailedVehicles$);
        })
      )
      .subscribe({
        next: (vehicles: VehicleWithLessDetails[]) => {
          this.vehicles = vehicles;
          this.uniqueBrands = [
            'All',
            ...new Set(vehicles.map((v) => v.brand?.name).filter(Boolean)),
          ];
          this.uniqueTypes = ['All', ...new Set(vehicles.map((v) => v.type?.type).filter(Boolean))];
          this.uniqueConditions = [
            'All',
            ...new Set(vehicles.map((v) => v.condition).filter(Boolean)),
          ];

          this.uniqueHoldings = [
            'All',
            ...new Set(vehicles.map((v) => v.holding?.name).filter(Boolean)),
          ];
          this.uniqueColors = [
            'All',
            ...new Set(vehicles.map((v) => v.color?.name).filter(Boolean)),
          ];
          this.uniqueEngines = [
            'All',
            ...new Set(vehicles.map((v) => v.specs?.engine?.engineType).filter(Boolean)),
          ];
          this.uniqueFuels = [
            'All',
            ...new Set(vehicles.map((v) => v.specs?.fuel?.fuelType).filter(Boolean)),
          ];
          this.uniqueSeats = [
            'All',
            ...new Set(vehicles.map((v) => v.specs?.seats?.quantity).filter(Boolean)),
          ];
          this.uniqueDoors = [
            'All',
            ...new Set(vehicles.map((v) => v.specs?.doors?.quantity).filter(Boolean)),
          ];
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching vehicles:', error.message);
        },
      });
  }

  /**
   * Applies current filter settings to the vehicle list.
   *
   * @returns VehicleWithLessDetails[] Array of vehicles that match the filter criteria.
   */
  public getFilteredVehicles(): VehicleWithLessDetails[] {
    return this.vehicles.filter((v) => {
      return (
        (this.filters.brand === 'All' || v.brand?.name === this.filters.brand) &&
        (this.filters.type === 'All' || v.type?.type === this.filters.type) &&
        (!this.filters.year || v.year >= this.filters.year) &&
        (!this.filters.maxPrice || v.price <= this.filters.maxPrice) &&
        (!this.filters.maxMileage || v.mileage <= this.filters.maxMileage) &&
        (this.filters.condition === 'All' || v.condition === this.filters.condition) &&
        (this.filters.holding === 'All' || v.holding?.name === this.filters.holding) &&
        (this.filters.color === 'All' || v.color?.name === this.filters.color) &&
        (this.filters.engine === 'All' || v.specs?.engine?.engineType === this.filters.engine) &&
        (this.filters.fuel === 'All' || v.specs?.fuel?.fuelType === this.filters.fuel) &&
        (this.filters.seats === 'All' || v.specs?.seats?.quantity === this.filters.seats) &&
        (this.filters.doors === 'All' || v.specs?.doors?.quantity === this.filters.doors)
      );
    });
  }

  /**
   * Resets all applied filters to their default state.
   *
   * @returns void
   */
  public resetFilters(): void {
    this.filters = {
      brand: 'All',
      type: 'All',
      year: null,
      maxPrice: null,
      maxMileage: null,
      condition: 'All',
      holding: 'All',
      color: 'All',
      engine: 'All',
      fuel: 'All',
      seats: 'All',
      doors: 'All',
    };
  }

  /**
   * Dynamically updates the filter dropdown options based on current filter state.
   *
   * @returns void
   */
  public updateFilterOptions(): void {
    const filtered = this.getFilteredVehicles();
    const allVehicles = this.vehicles;

    this.uniqueBrands = [
      'All',
      ...new Set(
        (this.filters.holding === 'All' ? allVehicles : filtered)
          .map((v) => v.brand?.name)
          .filter(Boolean)
      ),
    ];
    let typeSource = filtered;

    if (this.filters.brand === 'All' && this.filters.holding === 'All') {
      typeSource = allVehicles;
    } else if (this.filters.brand === 'All' && this.filters.holding !== 'All') {
      typeSource = this.vehicles.filter((v) => v.holding?.name === this.filters.holding);
    }

    this.uniqueTypes = ['All', ...new Set(typeSource.map((v) => v.type?.type).filter(Boolean))];
    this.uniqueConditions = ['All', ...new Set(filtered.map((v) => v.condition).filter(Boolean))];
    this.uniqueHoldings = [
      'All',
      ...new Set(allVehicles.map((v) => v.holding?.name).filter(Boolean)),
    ];
    this.uniqueColors = ['All', ...new Set(filtered.map((v) => v.color?.name).filter(Boolean))];
    this.uniqueEngines = [
      'All',
      ...new Set(filtered.map((v) => v.specs?.engine?.engineType).filter(Boolean)),
    ];
    this.uniqueFuels = [
      'All',
      ...new Set(filtered.map((v) => v.specs?.fuel?.fuelType).filter(Boolean)),
    ];
    this.uniqueSeats = [
      'All',
      ...new Set(filtered.map((v) => v.specs?.seats?.quantity).filter(Boolean)),
    ];
    this.uniqueDoors = [
      'All',
      ...new Set(filtered.map((v) => v.specs?.doors?.quantity).filter(Boolean)),
    ];
  }
}
