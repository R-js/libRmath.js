'use strict';

const
  gulp = require('gulp'),
  tslint = require('gulp-tslint'),
  gutil = require('gulp-util'),
  ts = require('gulp-typescript'),
  merge = require('merge2'),
  clean = require('gulp-clean');

const tsP = ts.createProject('tsconfig.json');

gulp.task('clean:dist', function () {
  return gulp.src(['dist/**/*.*', 'dist/**/*'], {
    read: false
  }).
    pipe(clean());
});


gulp.task('tsc', function () {
  let tsResult = tsP.src().pipe(tsP()).on('error', function (err) {
    gutil.log('typescript transpile error:', err);
    process.exit(1);
  });

  return merge([
    tsResult.dts.pipe(gulp.dest('dist')),
    tsResult.js.pipe(gulp.dest('dist'))
  ]);
});


gulp.task('lint', function () {
  return gulp.src(['./index.ts', './lib/**/*.{ts,tsx}'])
    .pipe(tslint({
      formatter: 'verbose'
    }))
    .pipe(tslint.report({
      emitError: false
    }));
});


gulp.task('js', gulp.series('lint', 'tsc'));
gulp.task('build', gulp.series('clean:dist', 'js'))
gulp.task('default', gulp.series('clean:dist', 'js'));
