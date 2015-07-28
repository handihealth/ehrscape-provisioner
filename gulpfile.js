var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var copy = require('gulp-copy');

gulp.task('default', function() {
  gulp.start('combine-angular', 'sass');
});

gulp.task('combine-angular', function() {
  return gulp.src([
      './app/bower_components/jquery/dist/jquery.min.js',
      './app/bower_components/foundation/js/vendor/modernizr.js',
      './app/bower_components/foundation/js/foundation.min.js',
      './app/bower_components/angular/angular.min.js',
      './app/bower_components/angular-route/angular-route.min.js',
      './app/bower_components/angular-resource/angular-resource.min.js',
      './app/bower_components/angular-foundation/mm-foundation-tpls.min.js',
      './app/app.js',
      './app/models/*.js',
      './app/controllers/*.js',
      './app/directives/*.js',
      './app/services/*.js'
    ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('sass', function () {
  gulp.src([
      './bower_components/foundation/scss/normalize.scss',
      './bower_components/foundation/scss/foundation.scss',
      './bower_components/nsPopover/sass/ns-popover.scss',
      './assets/stylesheets/style.scss'
    ])
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('watch', function() {
  gulp.watch(['./app/*.js', './app/*/*.js'], ['combine-angular']);
});
