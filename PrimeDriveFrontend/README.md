# PrimeDriveFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Testing and coverage

- Local watch mode: `npm test`
- CI/single-run with coverage: `npm run test:ci` (also used by GitHub Actions)
- Coverage reports are written to `coverage/prime-drive-frontend/` (`index.html` for humans, `lcov.info` for tools/badges).
- Coverage thresholds live in `karma.conf.js` under `coverageThresholds`; failing thresholds make the CI job fail.

### CI status

The workflow **OPS-004 – Jasmine & Karma for Frontend Tests** runs on push/PR to `main`.

Example status badge (adjust path if the repo or workflow name changes):

![Frontend Tests](https://github.com/Champion0899/PrimeDrive/actions/workflows/ops-004-frontend-tests.yml/badge.svg)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
