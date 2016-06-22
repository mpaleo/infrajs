var gulp = require('gulp'),
    cssmin = require('gulp-cssmin'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    babel = require('gulp-babel');

gulp.task('watch', function () {
    gulp.watch('styles/src/**/*.less', ['compile-less']);
    gulp.watch('scripts/src/**/*.js', ['compile-js']);
});

gulp.task('compile-less', function () {
    gulp.src('styles/src/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest('styles/dist/'))
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('styles/dist/'))
});

gulp.task('compile-js', function () {
    gulp.src('scripts/src/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('scripts/dist'))
        .pipe(rename({
            extname: '.js'
        }))
        .pipe(gulp.dest('scripts/dist/'))
});

gulp.task('default', ['compile-less', 'compile-js', 'watch']);
