'use strict';

var path = require('path'),
  gulp = require('gulp'),
  watch = require('gulp-watch'),
  //sass = require('gulp-sass'),
  tslint = require('gulp-tslint'),
  sourcemaps = require('gulp-sourcemaps'),
  //autoprefixer = require('gulp-autoprefixer'),
  gutil = require('gulp-util'),
  buffer = require('vinyl-buffer'),
  source = require('vinyl-source-stream'),
  browserify = require('browserify'),
  tsify = require('tsify'),
 // ts = require('gulp-typescript'),
  clean = require('gulp-clean');

gulp.task('clean:dist', function () {
  return gulp.src(['dist/**/*.*', 'dist/**/*'], {
    read: false
  }).
    pipe(clean());
});

/*
gulp.task('copy-fonts', function () {
  return gulp.src([
      './src/scss/3rdparty/fonts/flaticon.css',
      './src/scss/3rdparty/fonts/Flaticon.eot',
      './src/scss/3rdparty/fonts/Flaticon.svg',
      './src/scss/3rdparty/fonts/Flaticon.ttf',
      './src/scss/3rdparty/fonts/Flaticon.woff'

    ])
    .pipe(gulp.dest('dist/css'));
});
*/

/*
gulp.task('copy-public', function () {

  return gulp.src('./src/public/*.*')
    .pipe(gulp.dest('dist/public/'));
});

gulp.task('copy-html', function () {

  return gulp.src('./src/*.html')
    .pipe(gulp.dest('dist/'));
});

gulp.task('copy-mockserver', function () {
  return gulp.src('./src/mockserver/mockserver.json')
    .pipe(gulp.dest('dist/'));

});
*/

/*
gulp.task('copy',
  gulp.parallel('copy-mockserver', 'copy-html', 'copy-public', 'copy-fonts'));
*/

/*
gulp.task('ts-mock', function () {
  let rc = browserify({
      entries: ['src/main.tsx'],
      debug: true
   
    })
    .plugin(tsify)
  
    .bundle()
    .on('error', function (err) {
      gutil.log('Browserify error:', err);
      process.exit(1);
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/js'));
  return rc;
});
*/

gulp.task('ts', function () {
  let rc = browserify({
    entries: ['./lib/index.ts'],
    debug: true
  })
    .plugin(tsify)
    .bundle()
    .on('error', function (err) {
      gutil.log('Browserify error:', err);
      process.exit(1);
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/'));
  return rc;
});

/*
gulp.task('mockserver-compile', function () {
  return gulp.src(
      [
        'src/mockserver/mockserver.ts'
      ], {
        base: 'src/mockserver'
      })
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(ts({
      module: "commonjs",
      "target": "es5",
      "lib": ["es6", "dom"],
      "sourceMap": true,
      "moduleResolution": "node",
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/'));
});
*/

/*
gulp.task('scss-watch', function () {

  var auto_prefixer_options = {
    browsers: ['last 2 versions'],
    add: true,
    remove: true,
    flexbox: true
  };

  return watch('./src/scss/*.{sass,scss}', {
    ignoreInitial: false
  }, function (v) {

    let files = v.history.map((file) => {
      return path.basename(file);
    });

    files.forEach((file) => {
      console.log('file %s changed', file);
    });

    gulp.src('./src/scss/*.{sass,scss}')
      .pipe(sourcemaps.init())
      .pipe(sass(undefined).on('error', sass.logError))
      .pipe(autoprefixer(auto_prefixer_options))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('dist/css'));
  });
});
*/

/*gulp.task('scss', function () {
  var auto_prefixer_options = {
    browsers: ['last 2 versions'],
    add: true,
    remove: true,
    flexbox: true
  };

  return gulp.src('./src/scss/*.{sass,scss}')
    .pipe(sourcemaps.init())
    .pipe(sass(undefined).on('error', sass.logError))
    .pipe(autoprefixer(auto_prefixer_options))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css'));

});*/

gulp.task('lint', function () {
  return gulp.src('./lib/**/*.{ts,tsx}')
    .pipe(tslint({
      formatter: 'verbose'
    }))
    .pipe(tslint.report({
      emitError: false
    }));
});

//gulp.task('js-mock', gulp.series('lint', 'ts-mock'));

gulp.task('js', gulp.series('lint', 'ts'));
gulp.task('build', gulp.series('clean:dist',  'js' ))
gulp.task('default', gulp.series('clean:dist',  'js'));
//gulp.task('scss:html', gulp.parallel('copy', 'scss'));