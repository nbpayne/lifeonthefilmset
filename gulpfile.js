const { 
  dest,
  parallel, 
  src,
  series,
  watch
} = require('gulp');
const child = require('child_process');
const clean = require('gulp-clean');
const cleanCSS = require('gulp-clean-css');
const csslint = require('gulp-csslint');
const gulpif = require('gulp-if');
const jshint = require('gulp-jshint');
const lazypipe = require('lazypipe');
const log = require('gutil-color-log');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const useref = require('gulp-useref');
const wiredep = require('gulp-wiredep');

// Clean up old files
function cleanUp() {
  return src([
    '_includes/head.html', 
    '_includes/foot.html', 
    'css/**/*.*', 
    'js/**/*.*'
  ], { read: false, allowEmpty: true })
    .pipe(clean());
}

// Copy Font Awesome fonts and SCSS to project
function fontAwesome() {
  return src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
    .pipe(dest('fonts'));
}

// Compile Fonts CSS
function fontsCss() {
  return src('__sass/fontawesome/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(cleanCSS())
    .pipe(rename({suffix:'.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('css/fontawesome'));
}

// Compile Vendor CSS
function vendorCss() {
  return src('__sass/vendor/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ silenceDeprecations: ['import','global-builtin','if-function','color-functions'] }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(cleanCSS())
    .pipe(rename({suffix:'.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('css/vendor'));
}

// Compile custom CSS
function customCss() {
  return src('__sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(csslint())
    .pipe(csslint.formatter())
    .pipe(sourcemaps.write())
    .pipe(cleanCSS())
    .pipe(rename({suffix:'.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('css'));
}

// Wire bower dependencies
function wireDependencies() {
  return src('__includes/*.html')
    .pipe(wiredep())
    .pipe(dest('__includes'));
}

// Build javascript files
function js() {
  // Lint, sourcemap, and uglify final js files
  var lintjs = lazypipe()
    .pipe(jshint)
    .pipe(jshint.reporter, 'jshint-stylish');

  var processjs = lazypipe()
    .pipe(sourcemaps.init)
    .pipe(uglify)
    .pipe(sourcemaps.write, '.')
    .pipe(dest, '.');

  return src('__includes/*.html')
    .pipe(useref())
    .pipe(gulpif('*.js', processjs()))
    .pipe(gulpif('*.html', dest('_includes')));
};

// Run `jekyll serve`
function jekyllServe() {
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
};

// Watch for file changes
function watchFiles() {
  // Watch files
  watch('__sass/vendor/*.scss', series(vendorCss));
  watch('__sass/*.scss', series(customCss));
  watch(['__includes/*.html', '__js/**/*.js'], series(js));
};

// --------------------------------------------------------------------------------------------------------------------
// Meta-tasks
// - default: compile all assets, and start jekyll
// --------------------------------------------------------------------------------------------------------------------

exports.default = series(
  cleanUp,
  fontAwesome,
  parallel(fontsCss, vendorCss, customCss, wireDependencies),
  js,
  parallel(jekyllServe, watchFiles)
);
