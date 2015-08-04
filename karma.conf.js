module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/ngQueue/ngQueue.js',
      'app/bower_components/sweetalert/dist/sweetalert.min.js',
      'app/app.js',
      'app/controllers/*.js',
      'app/directives/*.js',
      'app/data/*.js',
      'app/models/*.js',
      'test/controllers/*.js',
      'test/models/*.js',
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-junit-reporter'
    ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};