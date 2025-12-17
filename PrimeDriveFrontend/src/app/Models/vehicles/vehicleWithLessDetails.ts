import { Brand } from './brand.interface';
import { Color } from './color.interface';
import { Holding } from './holding.interface';
import { SpecsWithDetails } from './specsWithDetails.interface';
import { Type } from './type.interface';
import { Vehicle } from './vehicle.interface';

/**
 * Extended interface representing a vehicle with essential branding and type information.
 * Builds on the base Vehicle interface and adds only brand and type for lightweight use cases.
 *
 * Author: Fatlum Epiroti
 * Version: 1.0.0
 * Date: 2025-06-03
 */
export interface VehicleWithLessDetails extends Vehicle {
  brand: Brand;
  type: Type;
  holding: Holding;
  color: Color;
  specs: SpecsWithDetails;
}
