// REQUIRED MODULES TO COMPILE APP/WEBSITE
var path = require('path');
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    babel = require("gulp-babel"),
    handlebars = require('gulp-compile-handlebars'),
    zip = require('gulp-zip'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    rev = require('gulp-rev'),
    revDel = require('rev-del'),
    del = require('del'),
    revNapkin = require('gulp-rev-napkin'),
    rename = require('gulp-rename'),
    sizereport = require('gulp-sizereport'),
    sourcemaps = require('gulp-sourcemaps');

//THIS IS SETTING THE DEFAULT PATH TO THE SASS AND HANDLEBARS FILES
var config = {};

    config.src = {
      js: 'app/js/**/*.js',
      sass: 'app/styles/**/*.scss',
      mainSass: 'app/styles/main.scss',
      json: 'app/js/**/*.json',
      html: 'app/html/**/*.html',
      hbs: 'app/html/**/*.hbs',
      requirejs: 'bower_components/requirejs/*.js',
      jqueryjs: 'bower_components/jquery/dist/*.js',
      assetsFonts: "public/assets/fonts/**/**",
      assetsImages: "public/assets/img/**/**"
    };

    config.dest = {
      outputPath: "dist",
      publicOutputPath: "public",
      zipDist: "dist/**/*"
    };

// CLEAN THE DIST BEFORE WE REBUILD
gulp.task('clean', function(cb){
   return del(['dist/**/*'], cb);
});

// THIS PREPARES ALL OF THE NEEDED FILES TO BE INCLUDED IN THE DIST FOLDER
gulp.task('include_files', ["include_files:bower_js", "include_files:fonts", "include_files:images"]);


gulp.task('include_files:bower_js', function () {
  var vendorFolder = config.dest.outputPath+"/js/vendor";

  return gulp.src([config.src.requirejs, config.src.jqueryjs])
        .pipe(gulp.dest(vendorFolder));
});

gulp.task('include_files:fonts', function () {
  var assetsFontsFolder = config.dest.outputPath+"/assets/fonts";

  return gulp.src(config.src.assetsFonts)
        .pipe(gulp.dest(assetsFontsFolder));
});

gulp.task('include_files:images', function () {
  var assetsImagesFolder = config.src.outputPath+"/assets/img";

  return  gulp.src(config.src.assetsImages)
          .pipe(gulp.dest(assetsImagesFolder));
});


//THIS TAKES CARE OF COMPILING ALL OF THE LESS FILES AND CONCATINATING THEM INTO ONE MAIN.CSS FILE
gulp.task('compile_sass', function() {

  var sassFolder = config.dest.outputPath+"/css";

    return gulp.src(config.src.sass)  // only compile the entry file
        .pipe(sourcemaps.init())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(sassFolder))
        .pipe(browserSync.reload({stream: true}));

});

//THIS TAKES CARE OF COMPILING ALL OF THE JS FILES AND CONCATINATING THEM INTO ONE MAIN.JS FILE
gulp.task('compile_javascript', function() {

  var javascriptFolder = config.dest.outputPath+"/js";

    return gulp.src(config.src.js)  // only compile the entry file
        .pipe(sourcemaps.init())
        .pipe(babel({modules: "amd"}))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(javascriptFolder))
        .pipe(browserSync.reload({stream: true}));

});

//THIS BUILDS THE INCLUDES THAT I AM USING IN THE HTML TEMPLATES
gulp.task('compile_handlebars', function() {

  gulp.src(config.src.hbs)
      .pipe(handlebars({pathForPage: "."}, { batch : ['./app/html/']}))
      .pipe(rename({extname: ".html"}))
      .pipe(gulp.dest(config.dest.outputPath))
      .pipe(browserSync.reload({stream: true}));

});


//THIS FUNCTION WATCHES FOR ANY CHANGES IN THE LESS FILES UNDER THE STYLES FOLDER AND THE HMTL FILES IN dist FOLDER.
//IT ALSO RUNS THE BROWSER SYNC FUNCTION THAT RELOADS THE BROWSER ON SAVE OF THE FILES.
gulp.task('server', function(done) {

  var _browser_URL = "./"+config.dest.outputPath;

  browserSync({
  	server: _browser_URL
  });

  gulp.watch(config.src.sass, ['compile_sass']);
  gulp.watch(config.src.hbs, ['compile_handlebars']);
  gulp.watch(config.src.js, ['compile_javascript']);

});

// SIZE REPORT
gulp.task('size_report', function () {
    return gulp.src('./dist/**/**')
        .pipe(sizereport({gzip: true}));
});

// THIS TASK WILL BUILD A ZIP DIST FOLDER
gulp.task('build_zip', ['compile_handlebars', 'compile_sass', 'include_files'], function(){

  var zipFile = src.outputPath+"/zip_file";

  return gulp.src(src.zipDist, {
      base: "dist/."
    })
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest(zipFile));
});

//THIS GULP TASK RUNS AND INITIATES THE SERVER
gulp.task('default',  function(callback){
  runSequence('clean', ['include_files', 'compile_javascript', 'compile_handlebars', 'compile_sass', 'server', 'size_report'], callback);
});

gulp.task('build', ['build_zip']);
