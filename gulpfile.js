var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function () {
  return gulp.src('./js/src/**/*.ts')
		.pipe(ts(tsProject))
    .pipe(gulp.dest('./js/'));
});
