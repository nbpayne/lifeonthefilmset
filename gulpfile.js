var gulp = require('gulp');
var child = require('child_process');
var csslint = require('gulp-csslint');
var cleanCSS = require('gulp-clean-css');
var del = require('del');
var gulpif = require('gulp-if');
var jshint = require('gulp-jshint');
var gulputil = require('gulp-util');
var lazypipe = require('lazypipe');
var log = require('gutil-color-log');
var merge = require('merge-stream');
var rename = require('gulp-rename');
var sass = require('gulp-sass')(require('sass'));
var sourcemaps = require('gulp-sourcemaps');
var stylish = require('csslint-stylish');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var wiredep = require('wiredep').stream;

// Clean out files
gulp.task('clean', function () {
  return del([
    '_includes/head.html', 
    '_includes/foot.html', 
    'css/**/*.*', 
    'js/**/*.*'
  ]);
});

// Build css files
gulp.task('css', function () {
  return merge(
    // Build vendor css files
    gulp.src('__sass/vendor/*.scss')
      .pipe(sass())
      .pipe(sourcemaps.init())
      .pipe(cleanCSS())
      .pipe(rename({suffix:'.min'}))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('css/vendor')),
    // Build app css files
    gulp.src('__sass/*.scss')
      .pipe(sass())
      .pipe(csslint())
      .pipe(csslint.formatter(stylish))
      .pipe(sourcemaps.init())
      .pipe(cleanCSS())
      .pipe(rename({suffix:'.min'}))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('css'))
  );
});

// Run `jekyll serve`
gulp.task('jekyll-serve', function () {
  const jekyll = child.spawn('jekyll', [
    'serve', 
    '--livereload',
    '--drafts',
    '--future'
  ]);
  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => log('yellow', 'Jekyll: ' + message));
  };
  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});

// Build javascript files
gulp.task('js', function () {
  // Lint, sourcemap, and uglify final js files
  // var lintjs = lazypipe()
  //   .pipe(jshint)
  //   .pipe(jshint.reporter, 'jshint-stylish');

  var processjs = lazypipe()
    .pipe(sourcemaps.init)
    .pipe(uglify)
    .pipe(sourcemaps.write, '.')
    .pipe(gulp.dest, '.');

  return gulp.src('__includes/*.html')
    .pipe(useref())
    .pipe(gulpif('*.js', processjs()))
    .pipe(gulpif('*.html', gulp.dest('_includes')));
});

// Watch for file changes
gulp.task('watch', function () {
  // Watch files
  gulp.watch('__sass/**/*.scss', gulp.series('css'));
  gulp.watch(['__includes/*.html', '__js/**/*.js'], gulp.series('js'));
});

// Wire bower dependencies
gulp.task('wiredep', function() {
  return gulp.src('__includes/*.html')
    .pipe(wiredep())
    .pipe(gulp.dest('__includes'));
});


// --------------------------------------------------------------------------------------------------------------------
// Meta-tasks
// - defeault: same as `serve`
// - serve: compile all assets, and start jekyll
// --------------------------------------------------------------------------------------------------------------------

gulp.task('serve',
  gulp.series(
    'clean', 
    gulp.parallel('css', 'wiredep'), 
    'js',
    gulp.parallel('jekyll-serve', 'watch')
  )
);

gulp.task('default', gulp.series('serve'));
