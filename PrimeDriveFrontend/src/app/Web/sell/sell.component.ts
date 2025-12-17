/**
 * SellComponent - UI-Komponente für das Einstellen und Bearbeiten von Fahrzeugen durch den Verkäufer.
 *
 * Diese Komponente erlaubt es eingeloggten Benutzern, neue Fahrzeuge inklusive technischer Spezifikationen
 * anzulegen sowie bestehende Fahrzeuge zu bearbeiten oder zu löschen.
 * Sie nutzt Reactive Forms zur Validierung und Verwaltung der Eingaben.
 *
 * @author Fatlum Epiroti
 * @version 1.0
 * @date 2025-06-06
 *
 * @property form - Formular zur Eingabe allgemeiner Fahrzeugdaten
 * @property specsForm - Formular zur Eingabe technischer Spezifikationen
 * @property brands - Liste aller verfügbaren Marken
 * @property colors - Liste aller verfügbaren Farben
 * @property types - Liste aller verfügbaren Fahrzeugtypen
 * @property specs - Liste gespeicherter Spezifikationen (derzeit nicht genutzt für Auswahl)
 * @property doors - Liste möglicher Türvarianten
 * @property seats - Liste möglicher Sitzanzahlen
 * @property engines - Liste verfügbarer Motorvarianten
 * @property fuels - Liste möglicher Kraftstoffarten
 * @property userVehicles - Liste der Fahrzeuge, die vom eingeloggten Nutzer eingestellt wurden
 *
 * @method onSubmit() - Validiert beide Formulare, erstellt Spezifikationen und Fahrzeugeintrag
 * @method loadUserVehicles(userId) - Lädt Fahrzeuge des Benutzers
 * @method editVehicle(vehicle) - Befüllt Formulare mit bestehenden Daten zum Bearbeiten
 * @method deleteVehicle(id) - Entfernt ein Fahrzeug aus der lokalen Liste
 * @method ngOnInit() - Initialisiert Daten beim Laden der Komponente
 */
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { Vehicle } from '../../Models/vehicles/vehicle.interface';
import { Brand } from '../../Models/vehicles/brand.interface';
import { Color } from '../../Models/vehicles/color.interface';
import { Type as VehicleType } from '../../Models/vehicles/type.interface';
import { Specs } from '../../Models/vehicles/specs.interface';
import { VehiclesService } from '../../Services/vehicles/vehicles.service';
import { UsersService } from '../../Services/users/users.service';
import { Seats } from '../../Models/vehicles/seats.interface';
import { Doors } from '../../Models/vehicles/doors.interface';
import { Engine } from '../../Models/vehicles/engine.interface';
import { Fuel } from '../../Models/vehicles/fuel.interface';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatDividerModule,
  ],
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SellComponent implements OnInit {
  private vehicleService = inject(VehiclesService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    id: [''],
    name: [''],
    price: [0],
    year: [new Date().getFullYear()],
    image: [''],
    mileage: [0],
    condition: [''],
    vehicleHistory: [''],
    brandsId: [''],
    specsId: [''],
    typesId: [''],
    colorsId: ['', Validators.required],
    sellerId: [''],
  });

  specsForm: FormGroup = this.fb.group({
    id: [''],
    powerKw: [0],
    powerPs: [0],
    lengthMillimeter: [0],
    widthMillimeter: [0],
    heightMillimeter: [0],
    trunkInLiterMin: [0],
    trunkInLiterMax: [0],
    zeroToHundredInSeconds: [0],
    topSpeedInKmh: [0],
    consumptionHundredInX: [0],
    coTwoEmissionInGPerKm: [0],
    cubicCapacity: [0],
    doorsId: [''],
    seatsId: [''],
    engineId: [''],
    fuelsId: [''],
  });

  brands: Brand[] = [];
  colors: Color[] = [];
  types: VehicleType[] = [];
  specs: Specs[] = [];
  doors: Doors[] = [];
  seats: Seats[] = [];
  engines: Engine[] = [];
  fuels: Fuel[] = [];

  userVehicles: Vehicle[] = [];

  /**
   * Verarbeitet die Eingabe aus beiden Formularen (allgemeine Fahrzeugdaten und Spezifikationen).
   * Erstellt zunächst die technischen Spezifikationen, verknüpft diese anschliessend mit dem Fahrzeug
   * und speichert den Eintrag in der Datenbank. Führt anschliessend ein Reset der Formulare durch.
   */
  onSubmit() {
    if (this.form.invalid || this.specsForm.invalid) {
      console.warn('Formulareingaben ungültig.');
      this.form.markAllAsTouched();
      this.specsForm.markAllAsTouched();
      return;
    }

    this.usersService.getCurrentUser().subscribe((user) => {
      if (!user || !user.id) {
        console.warn('Kein eingeloggter Benutzer gefunden.');
        return;
      }

      const rawSpecs = this.specsForm.value;
      const rawVehicle = {
        ...this.form.value,
        sellerId: user.id,
      };

      const specsPayload = {
        id: '',
        powerKw: rawSpecs.powerKw,
        powerPs: rawSpecs.powerPs,
        lengthMillimeter: rawSpecs.lengthMillimeter,
        widthMillimeter: rawSpecs.widthMillimeter,
        heightMillimeter: rawSpecs.heightMillimeter,
        trunkInLiterMin: rawSpecs.trunkInLiterMin,
        trunkInLiterMax: rawSpecs.trunkInLiterMax,
        zeroToHundredInSeconds: rawSpecs.zeroToHundredInSeconds,
        topSpeedInKmh: rawSpecs.topSpeedInKmh,
        consumptionHundredInX: rawSpecs.consumptionHundredInX,
        coTwoEmissionInGPerKm: rawSpecs.coTwoEmissionInGPerKm,
        cubicCapacity: rawSpecs.cubicCapacity,
        doorsId: rawSpecs.doorsId,
        seatsId: rawSpecs.seatsId,
        engineId: rawSpecs.engineId,
        fuelsId: rawSpecs.fuelsId,
      };

      this.vehicleService.createSpecs(specsPayload).subscribe((createdSpecs) => {
        const vehicleData: Vehicle = {
          ...rawVehicle,
          specsId: createdSpecs.id,
        };
        console.log('Vehicle Data:', vehicleData);
        this.vehicleService.createVehicle(vehicleData).subscribe(() => {
          this.loadUserVehicles(user.id);

          this.form.reset({
            id: '',
            name: '',
            price: 0,
            year: new Date().getFullYear(),
            image: '',
            mileage: 0,
            condition: '',
            vehicleHistory: '',
            brandsId: '',
            specsId: '',
            typesId: '',
            colorsId: '',
            sellerId: '',
          });

          this.specsForm.reset({
            id: '',
            powerKw: 0,
            powerPs: 0,
            lengthMillimeter: 0,
            widthMillimeter: 0,
            heightMillimeter: 0,
            trunkInLiterMin: 0,
            trunkInLiterMax: 0,
            zeroToHundredInSeconds: 0,
            topSpeedInKmh: 0,
            consumptionHundredInX: 0,
            coTwoEmissionInGPerKm: 0,
            cubicCapacity: 0,
            doorsId: '',
            seatsId: '',
            engineId: '',
            fuelsId: '',
          });
        });
      });
    });
  }

  /**
   * Lädt alle Fahrzeuge aus der Datenbank und filtert jene heraus,
   * die vom aktuell eingeloggten Benutzer eingestellt wurden.
   *
   * @param userId - Die eindeutige ID des aktuell eingeloggten Benutzers
   */
  loadUserVehicles(userId: string) {
    this.vehicleService.getVehicles().subscribe((vehicles) => {
      this.userVehicles = vehicles.filter((v) => v.sellerId === userId);
    });
  }

  /**
   * Lädt die vorhandenen Werte eines Fahrzeugs in die Formulare, um eine Bearbeitung zu ermöglichen.
   * Ruft zusätzlich die zugehörigen technischen Spezifikationen ab und trägt sie ins Spezifikationsformular ein.
   *
   * @param vehicle - Das zu bearbeitende Fahrzeugobjekt
   */
  editVehicle(vehicle: Vehicle) {
    this.form.patchValue(vehicle);
    if (vehicle.specsId) {
      this.vehicleService.getSpecsById(vehicle.specsId).subscribe((specs) => {
        this.specsForm.patchValue(specs);
      });

      this.form.patchValue({
        colorsId: vehicle.colorsId,
        brandsId: vehicle.brandsId,
        typesId: vehicle.typesId,
        sellerId: vehicle.sellerId,
        name: vehicle.name,
        price: vehicle.price,
        year: vehicle.year,
        image: vehicle.image,
        mileage: vehicle.mileage,
        condition: vehicle.condition,
        vehicleHistory: vehicle.vehicleHistory,
      });
    }
  }

  /**
   * Entfernt ein Fahrzeug mit der übergebenen ID aus der lokalen Fahrzeugliste.
   * Dieser Vorgang betrifft nur die lokale Anzeige, nicht die Datenbank.
   *
   * @param id - Die ID des Fahrzeugs, das gelöscht werden soll
   */
  deleteVehicle(id: string) {
    this.userVehicles = this.userVehicles.filter((v) => v.id !== id);
  }

  /**
   * Initialisiert die Komponente beim Laden.
   * Lädt alle erforderlichen Referenzdaten (z.NNBSPB. Marken, Farben, Typen usw.)
   * sowie die Fahrzeugliste des aktuell eingeloggten Nutzers.
   */
  ngOnInit() {
    this.vehicleService.getBrands().subscribe((data) => (this.brands = data));
    this.vehicleService.getColors().subscribe((data) => (this.colors = data));
    this.vehicleService.getTypes().subscribe((data) => (this.types = data));
    this.vehicleService.getDoors().subscribe((data) => {
      this.doors = data;
    });
    this.vehicleService.getSeats().subscribe((data) => {
      this.seats = data;
    });
    this.vehicleService.getEngines().subscribe((data) => {
      this.engines = data;
    });
    this.vehicleService.getFuels().subscribe((data) => {
      this.fuels = data;
    });
    this.usersService.getCurrentUser().subscribe((user) => {
      if (user && user.id) {
        this.form.patchValue({ sellerId: user.id });
        this.loadUserVehicles(user.id);
      }
    });
  }
}
