let preprocessor = 'sass';
const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const del = require('del');

//Browsersync
function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: { baseDir: 'app/' }, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		online: true // Режим работы: true или false
	})
}

function scripts() {
	return src([ 
		'node_modules/jquery/dist/jquery.min.js',
		'app/js/app.js',
		])
	.pipe(concat('app.min.js'))
	.pipe(uglify())
	.pipe(dest('app/js/'))
	.pipe(browserSync.stream())
}

function styles() {
	return src('app/' + 'scss' + '/main.' + 'scss' + '')
	.pipe(eval(preprocessor)())
	.pipe(concat('main.min.css'))
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } ))
	.pipe(dest('app/css/'))
	.pipe(browserSync.stream())
}

function images() {
	return src('app/img/src/**/*')
	.pipe(newer('app/img/dest/'))
	.pipe(imagemin())
	.pipe(dest('app/img/dest/'))
}

function cleanimg() {
	return del('app/images/dest/**/*', { force: true })
}

function buildcopy() {
	return src([
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/images/dest/**/*',
		'app/**/*.html',
		], { base: 'app' })
	.pipe(dest('dist'))
}

function cleandist() {
	return del('dist/**/*', { force: true })
}

function startwatch() {

	
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);

	watch('app/**/' + 'scss' + '/**/*', styles);

	watch('app/**/*.html').on('change', browserSync.reload);

	watch('app/images/src/**/*', images);

}


exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;

exports.build = series(cleandist, styles, scripts, images, buildcopy);
exports.default = parallel(styles, scripts, browsersync, startwatch);
