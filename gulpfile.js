var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var karma = require('gulp-karma');
var angularProtractor = require('gulp-angular-protractor');

var testFiles = [
  './bower_components/angular/angular.js',
  './bower_components/angular-route/angular-route.js',
  './bower_components/angular-mocks/angular-mocks.js',
  './bower_components/sweetalert/dist/sweetalert.min.js',
  './src/angular/app.js',
  './src/angular/controllers/*.js',
  './src/angular/directives/*.js',
  './src/angular/models/*.js',
  './test/controllers/*.js',
  './test/models/*.js',
];

gulp.task('test', function() {
  gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      throw err;
    });
  gulp.src(['./e2e-test/*.js'])
    .pipe(angularProtractor({
        'configFile': './e2e-test/protractor.conf.js',
        'args': ['--baseUrl', 'http://127.0.0.1:8080'],
        'autoStartStopServer': true,
        'debug': true
    }))
    .on('error', function(e) {
      throw e;
    });
});

gulp.task('default', function() {
  gulp.start('combine-angular', 'sass', 'copy-sample-requests');
});

gulp.task('combine-angular', function() {
  return gulp.src([
      './bower_components/jquery/dist/jquery.min.js',
      './bower_components/foundation/js/vendor/modernizr.js',
      './bower_components/foundation/js/foundation.min.js',
      './bower_components/sweetalert/dist/sweetalert.min.js',
      './bower_components/angular/angular.min.js',
      './bower_components/angular-route/angular-route.min.js',
      './src/angular/app.js',
      './src/angular/models/*.js',
      './src/angular/controllers/*.js',
      './src/angular/directives/*.js',
    ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('sass', function () {
  gulp.src([
      './bower_components/foundation/scss/normalize.scss',
      './bower_components/foundation/scss/foundation.scss',
      './bower_components/sweetalert/dist/sweetalert.css',
      './src/assets/stylesheets/style.scss'
    ])
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('copy-sample-requests', function() {
  gulp.src(['./src/assets/sample_requests/*.*'])
    .pipe(gulp.dest('./public/data'));
});

gulp.task('watch-test', function() {
  gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});

gulp.task('watch', function() {
  gulp.watch('./src/assets/stylesheets/*.scss', ['sass']);
  gulp.watch(['./src/angular/*.js', './app/*/*.js'], ['combine-angular']);
  gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});
