import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Bootstraps the Angular application using the root component and app configuration.
 * Handles initial setup and launches the application in the browser.
 *
 * Author: Fatlum Epiroti & Jamie Schüpbach
 * Version: 1.0.0
 * Date: 2025-06-03
 */
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
