var gulp = require('gulp')
var connect = require('gulp-connect')
var opn = require('opn')
var sourcemaps = require('gulp-sourcemaps')
var less = require('gulp-less')
var LessAutoprefix = require('less-plugin-autoprefix')
var gulpSequence = require('gulp-sequence')
var babel = require('gulp-babel')
var clean = require('gulp-clean')
var cssnano = require('gulp-cssnano')
var rename = require("gulp-rename")
var uglify = require('gulp-uglify')

var autoprefix = new LessAutoprefix({ browsers: ['> 0%'] })
var devServerPort = 8080

/*dev*/
gulp.task('dev-clean', function(cb) {
    return gulp.src('./dev_temp')
            .pipe(clean())
})

gulp.task('dev-less', function(cb) {
    return gulp.src('./src/less/**/*.less')
            .pipe(sourcemaps.init())
            .pipe(less({
                plugins: [autoprefix]
            }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./dev_temp/css'))
            .pipe(connect.reload())
})

gulp.task('dev-js', function(cb) {
    return gulp.src('./src/js/**/*.js')
            .pipe(sourcemaps.init())
            .pipe(babel({
            presets: [["es2015", { "modules": false }]]
            }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./dev_temp/js'))
            .pipe(connect.reload())
})

gulp.task('dev-html', function(cb) {
    return gulp.src('./playground/**/*.html')
            .pipe(connect.reload())
})

gulp.task('dev-server', function(cb) {
    return connect.server({
        root: './',
        livereload: true,
        port: devServerPort
    })
})

gulp.task('dev-opn',function(){
    return opn('http://localhost:'+devServerPort+'/playground/index.html')
})

gulp.task('dev-watch', function () {
    gulp.watch(['./playground/**/*.html'], ['dev-html'])
    gulp.watch(['./src/less/**/*.less'], ['dev-less'])
    gulp.watch(['./src/js/**/*.js'], ['dev-js'])
})

gulp.task('dev', gulpSequence('dev-clean', ['dev-less','dev-js'],'dev-opn','dev-watch','dev-server'))

/*build*/
gulp.task('build-clean', function(cb) {
    return gulp.src('./dist')
            .pipe(clean())
})

gulp.task('build-less', function(cb) {
    return gulp.src('./src/less/**/*.less')
            .pipe(less({
                plugins: [autoprefix]
            }))
            .pipe(gulp.dest('./dist/css'))
            .pipe(cssnano())
            .pipe(rename({
                suffix: "-min"
            }))
            .pipe(gulp.dest('./dist/css'))
})

gulp.task('build-js', function(cb) {
    return gulp.src('./src/js/**/*.js')
            .pipe(babel({
            presets: [["es2015", { "modules": false }]]
            }))
            .pipe(gulp.dest('./dist/js'))
            .pipe(uglify())
            .pipe(rename({
                suffix: "-min"
            }))
            .pipe(gulp.dest('./dist/js'))
})

gulp.task('build', gulpSequence('build-clean', ['build-less','build-js']))