var del     = require('del')
  , gulp    = require('gulp')
  , header  = require('gulp-header')
  , iife    = require('gulp-iife')
  , rename  = require('gulp-rename')
  , stand   = require('gulp-standard')
  , trim    = require('gulp-trimlines')
  , uglify  = require('gulp-uglify')
  , pkg     = require('./package.json')


var headerLong = ['/*!'
  , '* <%= pkg.name %> - <%= pkg.description %>'
  , '* @version <%= pkg.version %>'
  , '* <%= pkg.homepage %>'
  , '*'
  , '* @copyright <%= pkg.author %>'
  , '* @license <%= pkg.license %>'
  , '*/;'
  , ''].join('\n')

var headerShort = '/*! <%= pkg.name %> v<%= pkg.version %> <%= pkg.license %>*/;'

gulp.task('clean', function() {
  return del([ 'dist/*' ])
})

gulp.task('copy', ['clean'], function() {
  return gulp.src('src/svg.resize.js')
    .pipe(iife())
    .pipe(header(headerLong, { pkg: pkg }))
    .pipe(trim({ leading: false }))
    .pipe(gulp.dest('dist'))
})


/**
 ‎* uglify the file
 * add the license info
 */
gulp.task('minify', ['copy'], function() {
  return gulp.src('dist/svg.resize.js')
    .pipe(uglify())
    .pipe(rename({ suffix:'.min' }))
    .pipe(header(headerShort, { pkg: pkg }))
    .pipe(gulp.dest('dist'))
})

gulp.task('standard', function () {
  return gulp.src(['./svg.resize.js'])
    .pipe(stand())
    .pipe(stand.reporter('default', {
      breakOnError: true,
      quiet: false
    }))
})


gulp.task('default', ['standard', 'clean', 'copy', 'minify'])