import gulp from 'gulp';
import del from 'del';
import babel from 'gulp-babel';
import babelify from 'babelify';
import sass from 'gulp-sass';
import watch from 'gulp-watch';
import plumber from 'gulp-plumber';
import browserify from 'browserify';
import sourcemaps from 'gulp-sourcemaps';
import electronConnect from 'electron-connect';
import packager from 'electron-packager';
import source from 'vinyl-source-stream';

const js = './src/**/*.js';
const scss = './src/**/*.scss';
const html = './src/**/*.html';
const pacagejson = './package.json';

gulp.task('clean', () => {
  return del.sync(['./lib']);
});

gulp.task('package', (cb) => {
  return packager({
    name: 'markit',
    dir: '.',
    out: 'lib/bin',
    overwrite: true,
    prune: true,
    arch: 'x64',
    platform: 'darwin',
    icon: 'icons/note.icns'
  }, (err, path) => {
    cb();
  });
});

gulp.task('package.json', () => {
  return gulp.src(pacagejson)
    .pipe(gulp.dest('./lib/'));
});

gulp.task('js', () => {
  return gulp.src(js)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('js:prod', () => {
  browserify({entyries: ['./src/app.js'], debug: true})
    .transform(babelify.configure({
      presets: ["es2015", "stage-0", "react"]}))
    .bundle()
    .on("error", function (err) { console.log("Error : " + err.message); })
    .pipe(source('app.js'))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('scss', () => {
  return gulp.src(scss)
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('./lib/'));
});

gulp.task('html', () => {
  return gulp.src(html)
    .pipe(plumber())
    .pipe(gulp.dest('./lib/'));
});

gulp.task('build:prod', ['js:prod', 'html', 'scss', 'package.json'], (done) => {
  done()
});

gulp.task('build:debug', ['js', 'html', 'scss', 'package.json'], (done) => {
  done()
});

gulp.task('continuous:watch', ['js', 'html', 'scss', 'package.json'], () => {
  watch([pacagejson], () => gulp.start('package.json'));
  watch([js], () => gulp.start('js'));
  watch([html], () => gulp.start('html'));
  watch([scss], () => gulp.start('scss'));
});

gulp.task('server', ['watch'], () => {
  const electron = electronConnect.server.create();
  electron.start();

  watch(['lib/*.js'], electron.restart);
  watch(['lib/renderer/**/*.{html,js,css}'], electron.reload);
});

gulp.task('watch', ['continuous:watch']);
gulp.task('default', ['js', 'html', 'scss', 'package.json']);
