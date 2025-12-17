import { Component, inject, OnInit } from '@angular/core';
import { Vehicle } from '../../../Models/vehicles/vehicle.interface';
import { ActivatedRoute } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { forkJoin, map, switchMap } from 'rxjs';
import { VehicleWithFullDetails } from '../../../Models/vehicles/vehicleWithFullDetails';
import { VehiclesService } from '../../../Services/vehicles/vehicles.service';
import { Brand } from '../../../Models/vehicles/brand.interface';
import { Color } from '../../../Models/vehicles/color.interface';
import { Type, Type as VehicleType } from '../../../Models/vehicles/type.interface';

/**
 * Component that displays full details of a specific vehicle.
 * Retrieves the vehicle ID from route parameters and fetches all related entities,
 * including brand, type, color, specifications, and seller information.
 *
 * Author: Fatlum Epiroti
 * Version: 1.0.0
 * Date: 2025-06-06
 */
@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatExpansionModule, MatIconModule],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss',
})
export class VehicleDetailsComponent implements OnInit {
  public vehicle!: VehicleWithFullDetails;
  private route = inject(ActivatedRoute);
  private VehiclesService = inject(VehiclesService);

  /**
   * Lifecycle hook that triggers the fetching of vehicle details after component initialization.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.getVehicleDetails();
  }

  /**
   * Fetches all detailed data for a vehicle by ID using the VehiclesService.
   * Aggregates related entities (brand, type, color, specs, seller, engine, fuel, doors, seats)
   * into a single VehicleWithFullDetails object.
   *
   * @returns void
   */
  private getVehicleDetails(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (!vehicleId) {
      console.error('Vehicle ID not found in route parameters.');
      return;
    }

    this.VehiclesService.getVehicleById(vehicleId)
      .pipe(
        switchMap((vehicle: Vehicle) =>
          forkJoin({
            brand: this.VehiclesService.getBrandById(vehicle.brandsId).pipe(
              map((brand: string | Brand) =>
                typeof brand === 'string' ? ({ name: brand } as Brand) : brand
              )
            ),
            type: this.VehiclesService.getTypeById(vehicle.typesId).pipe(
              map((type: Type) =>
                typeof type === 'string' ? ({ id: '', name: type, type: '' } as VehicleType) : type
              )
            ),
            color: this.VehiclesService.getColorById(vehicle.colorsId).pipe(
              map((color: string | Color) =>
                typeof color === 'string' ? ({ name: color } as Color) : color
              )
            ),
            specs: this.VehiclesService.getSpecsById(vehicle.specsId),
            seller: this.VehiclesService.getUserById(vehicle.sellerId),
          }).pipe(
            switchMap(({ brand, type, color, specs, seller }) =>
              forkJoin({
                engine: this.VehiclesService.getEngineById(specs.engineId),
                fuel: this.VehiclesService.getFuelById(specs.fuelsId),
                doors: this.VehiclesService.getDoorsById(specs.doorsId),
                seats: this.VehiclesService.getSeatsById(specs.seatsId),
              }).pipe(
                map((additionalSpecs) => {
                  const vehicleWithDetails: VehicleWithFullDetails = {
                    ...vehicle,
                    brand,
                    type,
                    color,
                    specs: {
                      ...specs,
                      engine: additionalSpecs.engine,
                      fuel: additionalSpecs.fuel,
                      doors: additionalSpecs.doors,
                      seats: additionalSpecs.seats,
                    },
                    seller,
                  };
                  return vehicleWithDetails;
                })
              )
            )
          )
        )
      )
      .subscribe({
        next: (vehicleWithDetails: VehicleWithFullDetails) => {
          this.vehicle = vehicleWithDetails;
          console.log('Vehicle details fetched successfully:', this.vehicle);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching vehicle details:', error.message);
        },
      });
  }
}
