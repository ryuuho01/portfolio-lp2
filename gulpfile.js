const gulp = require('gulp');//gulp本体

//scss
const sass = require('gulp-dart-sass');//Dart Sass はSass公式が推奨 @use構文などが使える
const plumber = require("gulp-plumber"); // エラーが発生しても強制終了させない
const notify = require("gulp-notify"); // エラー発生時のアラート出力
const browserSync = require("browser-sync"); //ブラウザリロード
const autoprefixer = require('gulp-autoprefixer');//ベンダープレフィックス自動付与
const gcmq = require('gulp-group-css-media-queries');//メディアクエリを一つにまとめる

// 入出力するフォルダを指定
const assetsBase = './_src';
const distBase = './public_html';

// const webpack = require('webpack');
// const webpackStream = require('webpack-stream');
// const webpackConfig = require('./webpack.config.js');

const srcPath = {
  'scss': assetsBase + '/_sass/**/*.scss',
  'html': distBase + '/*.html',
  'js': distBase + '/js/*.js'
};

const distPath = {
  'css': distBase + '/css/',
  'html': distBase + '/'
};

const TARGET_BROWSERS = [
  'last 2 versions',//各ブラウザの2世代前までのバージョンを担保
  'ie >= 11'//IE11を担保
];

/**
 * sass
 *
 */
const cssSass = () => {
  return gulp.src(srcPath.scss, {
    sourcemaps: true
  })
  .pipe(
    //エラーが出ても処理を止めない
    plumber({
      errorHandler: notify.onError('Error:<%= error.message %>')
    }))
  .pipe(sass({ outputStyle: 'expanded' })) //指定できるキー expanded compressed
  .pipe(gcmq())
  .pipe(autoprefixer(TARGET_BROWSERS))// ベンダープレフィックス自動付与
  .pipe(gulp.dest(distPath.css, { sourcemaps: './' })) //コンパイル先
  .pipe(browserSync.stream())
  .pipe(notify({
    // message: 'Sassをコンパイルしました！',
    onLast: true
  }))
}


/**
 * html
 */
const html = () => {
  return gulp.src(srcPath.html)
    .pipe(gulp.dest(distPath.html))
}

/**
 * ローカルサーバー立ち上げ
 */
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption);
}

const browserSyncOption = {
  // server: distBase
  // proxy: "nico.wp",       // ローカルにある「Site Domain」に合わせる
  // notify: false,                  // ブラウザ更新時に出てくる通知を非表示にする
  // open: "external",               // ローカルIPアドレスでサーバを立ち上げる
  server : {
    baseDir : './public_html',
    index : 'index.html',
  },
  ghostMode: {
    clicks: false,
    forms: false,
    scroll: false,
  },
}

/**
 * リロード
 */
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
}

/**
 *
 * ファイル監視 ファイルの変更を検知したら、browserSyncReloadでreloadメソッドを呼び出す
 * series 順番に実行
 * watch('監視するファイル',処理)
 */
const watchFiles = () => {
  gulp.watch(srcPath.scss, gulp.series(cssSass))
  gulp.watch(srcPath.js, gulp.series(browserSyncReload))
  gulp.watch(srcPath.html, gulp.series(browserSyncReload))
}

/**
 * seriesは「順番」に実行
 * parallelは並列で実行
 */
exports.default = gulp.series(
  gulp.parallel(html, cssSass),
  gulp.parallel(watchFiles, browserSyncFunc)
);
