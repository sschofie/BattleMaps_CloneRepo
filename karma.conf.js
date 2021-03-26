// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      type: 'html',
      dir: require('path').join(__dirname, './coverage/battle-maps')
    },
    reporters: ['progress', 'kjhtml'],
    jasmineHtmlReporter: {
      suppressAll: true, // Suppress all terminal messages
      suppressFailed: true // Suppress fail terminal messages
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    browserConsoleLogOptions: { level: 'warn' }, // Suppress all console 'log' and 'debug' messages
    singleRun: false,
    restartOnFileChange: true
  });
};
