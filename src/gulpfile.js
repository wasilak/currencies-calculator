var gulp = require("gulp");
var ts = require("gulp-typescript");

var tsProject = ts.createProject("tsconfig.json");

var files = [
  './js/src/**/*.ts'
];

gulp.task('default', function () {
  return gulp.src(files)
		.pipe(tsProject())
    .pipe(gulp.dest('./static/js/'));
});
