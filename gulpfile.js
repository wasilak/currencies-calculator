var gulp = require("gulp");
var ts = require("gulp-typescript");

var livereload = require('gulp-livereload');

var postcss = require('gulp-postcss');
var reporter = require('postcss-reporter');
var stylelint = require('stylelint');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var tsProject = ts.createProject("tsconfig.json");

var files = [
  './js/src/**/*.ts'
];

var watchFiles = [
  './js/src/**/*.ts',
  './index.php',
  './proxy.php',
  './css/style.css'
];

gulp.task('default', function () {
  return gulp.src(files)
		.pipe(tsProject())
    .pipe(gulp.dest('./js/'))
    .pipe(livereload());
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(watchFiles, ['default']);
});

gulp.task('lint:css', function() {
  return gulp.src('css/**/*.css')
    .pipe(postcss([
        stylelint({ /* options */ }),
        reporter({ clearMessages: true })
    ]));
});

gulp.task('lint:js', function() {
  return gulp.src('./js/app/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});
