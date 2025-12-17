const path = require('node:path');

module.exports = function (config) {
  const isCI = process.env.CI === 'true';
  const coverageThresholds = {
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70,
  };

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-junit-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {},
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    reporters: isCI
      ? ['progress', 'junit', 'coverage']
      : ['progress', 'kjhtml', 'coverage'],
    junitReporter: {
      outputDir: path.join(__dirname, 'coverage', 'prime-drive-frontend', 'junit'),
      outputFile: 'junit-report.xml',
      useBrowserName: false,
    },
    coverageReporter: {
      dir: path.join(__dirname, 'coverage', 'prime-drive-frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'lcovonly' },
        { type: 'text-summary' },
      ],
      check: {
        global: coverageThresholds,
      },
    },
    browsers: isCI ? ['ChromeHeadless'] : ['Chrome'],
    customLaunchers: {
      ChromeHeadless: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: !isCI,
    singleRun: isCI,
    restartOnFileChange: true,
  });
};
