import gulp from 'gulp';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import watch from 'gulp-watch';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import electronConnect from 'electron-connect';

const js = './src/**/*.js';
const scss = './src/**/*.scss';
const html = './src/**/*.html';

gulp.task('js', () => {
  return gulp.src(js)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
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

gulp.task('continuous:watch', ['js', 'html', 'scss'], () => {
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
gulp.task('default', ['js', 'html', 'scss']);

