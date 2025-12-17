import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

/**
 * Global application configuration for PrimeDrive.
 * Sets up essential Angular providers including HTTP client, router, and async animations.
 *
 * Author: Fatlum Epiroti & Jamie Schüpbach
 * Version: 1.0.0
 * Date: 2025-06-03
 */
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideRouter(routes), provideAnimationsAsync()],
};
