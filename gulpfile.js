var gulp = require('gulp'),
    jade = require('gulp-jade'),
    browserSync = require('browser-sync'),
    stylus = require('gulp-stylus'),
    koutoSwiss  = require('kouto-swiss'),
    minifyCSS = require('gulp-minify-css'),
    uncss = require('gulp-uncss'),
    glob = require('glob'),
    imagemin = require('gulp-imagemin'),
    del = require('del'),
    gulpif = require('gulp-if'),
    sprite = require('css-sprite').stream,
    reload = browserSync.reload,
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    concatCss = require('gulp-concat-css'),
    plumber = require('gulp-plumber'),
    react = require('gulp-react');


/*********BROWSER SYNC*************/
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "app"
        }
    });
});
/*******JADE***********/
gulp.task('templates', function() {
  gulp.src(['!views/layout.jade','!views/layout2.jade','views/*.jade'])
    .pipe(plumber())
    .pipe(jade({
        pretty: true
    }))
    .pipe(gulp.dest('app/'))
});
/********STYLUS**********/
gulp.task('css', function(){
    gulp.src('src/styl/main.styl')
    .pipe(plumber())
    .pipe(stylus({
        use:[koutoSwiss()]
    }))
    /*.pipe(uncss({
            html: glob.sync('app/*.html')
    }))*/
    .pipe(reload({stream:true, once: true}))
    .pipe(gulp.dest('src/css'))
});
gulp.task('cssPlugins', function(){
    gulp.src('src/styl/plugins.styl')
    .pipe(plumber())
    .pipe(stylus({
        use:[koutoSwiss()]
    }))
    .pipe(reload({stream:true, once: true}))
    .pipe(gulp.dest('src/css'))
});
gulp.task('cssConcat', function() {
  gulp.src(['src/css/plugins.css','src/css/main.css'])
    .pipe(plumber())
    .pipe(concatCss('main.css'))
    .pipe(minifyCSS())
    .pipe(reload({stream:true, once: true}))
    .pipe(gulp.dest('app/assets/css'))
});
/***********IMAGE***************/
gulp.task('imagemin', function() {
     gulp.src('src/img/**/*')
    .pipe(plumber())
    .pipe(imagemin({progressive: true, interlaced: true }))
    .pipe(gulp.dest('app/assets/img'));
});
/***********CLEAN***********/
gulp.task('clean', del.bind(null, ['.tmp', 'app/*'], {dot: true}));
/*********SPRITES*************/
gulp.task('sprites', function () {
    return gulp.src('src/sprites/*.png')
    .pipe(plumber())
    .pipe(sprite({
      name: 'img-sprites',
      style: 'sprites.styl',
      prefix: 'ic',
      orientation : 'vertical',
      margin: 0,
      cssPath: '../img',
      processor: 'stylus'
    }))
    .pipe(gulpif('*.png', gulp.dest('src/img/')))
    .pipe(gulpif('*.styl', gulp.dest('src/styl/')));  
});
/************REACT***********/
gulp.task('react', function () {
    gulp.src('src/react/**/*.jsx')
        .pipe(react())
        .pipe(gulp.dest('src/js/'));
});
/***********JAVASCRIPT*************/
gulp.task('js', function() {
  gulp.src(['src/js/**/*.js','!src/js/basket.min.js'])
    .pipe(plumber())
    .pipe(concat('main.js'))
    /*.pipe(uglify())*/
    .pipe(gulp.dest('app/assets/js'))
});
/*********COPY FONT*******/
gulp.task('fontscopy', function() {
         gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('app/assets/fonts'));
});
/*********COPY js*******/
gulp.task('jscopy', function() {
         gulp.src('src/js/basket.min.js')
        .pipe(gulp.dest('app/assets/js'));
});

/*********WATCH AND DEFAULT************/
gulp.task('watch', function () {
    gulp.watch('src/styl/*.styl', ['css','cssPlugins']);
    gulp.watch('views/*.jade', ['templates','css','cssPlugins','cssConcat']);
    gulp.watch('src/css/*.css', ['cssConcat']);
    gulp.watch(['app/*.html'], reload);
    gulp.watch('src/img/*.{jpg,png,gif}', ['imagemin']);
    gulp.watch('src/react/**/*.jsx', ['react','js',reload]);
    gulp.watch('src/js/**/*.js', ['js',reload]);
    gulp.watch('src/sprites/*.png', ['sprites']);
    gulp.watch('src/fonts/**/*', ['fontscopy']);
});
gulp.task('default', ['react','js','sprites','imagemin'/*,'clean'*/,'css','cssPlugins','cssConcat','templates','browser-sync','fontscopy','jscopy','watch']);