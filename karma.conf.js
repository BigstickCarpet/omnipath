// Karma config
// https://karma-runner.github.io/0.12/config/configuration-file.html

'use strict';

module.exports = function (karma) {
  var config = {
    frameworks: ['mocha', 'chai', 'sinon', 'host-environment'],
    reporters: ['verbose'],

    files: [
      // OmniPath
      'dist/omnipath.min.js',
      { pattern: 'dist/*.map', included: false, served: true },

      // Test Fixtures
      'test/fixtures/**/*.js',

      // Tests
      'test/specs/**/*.spec.js'
    ]
  };

  exitIfDisabled();
  configureCodeCoverage(config);
  configureLocalBrowsers(config);
  configureSauceLabs(config);

  console.log('Karma Config:\n', JSON.stringify(config, null, 2));
  karma.set(config);
};

/**
 * If this is a CI job, and Karma is not enabled, then exit.
 * (useful for CI jobs that are only testing Node.js, not web browsers)
 */
function exitIfDisabled () {
  var CI = process.env.CI === 'true';
  var KARMA = process.env.KARMA === 'true';

  if (CI && !KARMA) {
    console.warn('Karma is not enabled');
    process.exit();
  }
}

/**
 * Configures the code-coverage reporter
 */
function configureCodeCoverage (config) {
  if (process.argv.indexOf('--coverage') === -1) {
    console.warn('Code-coverage is not enabled');
    return;
  }

  config.reporters.push('coverage');
  config.coverageReporter = {
    reporters: [
      { type: 'text-summary' },
      { type: 'lcov' }
    ]
  };

  config.files = config.files.map(function (file) {
    if (typeof file === 'string') {
      file = file.replace(/^dist\/(.*?)(\.min)?\.js$/, 'dist/$1.coverage.js');
    }
    return file;
  });
}

/**
 * Configures the browsers for the current platform
 */
function configureLocalBrowsers (config) {
  var isMac = /^darwin/.test(process.platform);
  var isWindows = /^win/.test(process.platform);
  var isLinux = !isMac && !isWindows;

  if (isMac) {
    config.browsers = ['Firefox', 'Chrome', 'Safari'];
  }
  else if (isLinux) {
    config.browsers = ['Firefox', 'ChromeHeadless'];
  }
  else if (isWindows) {
    config.browsers = ['Firefox', 'Chrome', 'IE', 'Edge'];
  }
}

/**
 * Configures Sauce Labs emulated browsers/devices.
 * https://github.com/karma-runner/karma-sauce-launcher
 */
function configureSauceLabs (config) {
  var SAUCE = process.env.SAUCE === 'true';
  var username = process.env.SAUCE_USERNAME;
  var accessKey = process.env.SAUCE_ACCESS_KEY;

  if (!SAUCE || !username || !accessKey) {
    console.warn('SauceLabs is not enabled');
    return;
  }

  var project = require('./package.json');
  var testName = project.name + ' v' + project.version;
  var build = testName + ' Build #' + process.env.TRAVIS_JOB_NUMBER + ' @ ' + new Date();

  /* eslint camelcase:off */
  var sauceLaunchers = {
    SauceLabs_Chrome_Latest: {
      base: 'SauceLabs',
      platform: 'Windows 10',
      browserName: 'chrome'
    },
    SauceLabs_Firefox_Latest: {
      base: 'SauceLabs',
      platform: 'Windows 10',
      browserName: 'firefox'
    },
    SauceLabs_Safari_Latest: {
      base: 'SauceLabs',
      platform: 'macOS 10.12',
      browserName: 'safari'
    },
    SauceLabs_IE_11: {
      base: 'SauceLabs',
      platform: 'Windows 7',
      browserName: 'internet explorer'
    },
    SauceLabs_IE_Edge: {
      base: 'SauceLabs',
      platform: 'Windows 10',
      browserName: 'microsoftedge'
    },
  };

  config.reporters.push('saucelabs');
  config.browsers = Object.keys(sauceLaunchers);
  config.customLaunchers = Object.assign(config.customLaunchers || {}, sauceLaunchers);
  config.sauceLabs = {
    build: build,
    testName: testName,
    tags: [project.name],
  };
}
