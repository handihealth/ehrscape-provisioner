exports.config = {
  allScriptsTimeout: 11000,

  seleniumAddress: 'http://localhost:4444/wd/hub',

  specs: [
    '*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:3000/',

  rootElement: '.ng-app',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};