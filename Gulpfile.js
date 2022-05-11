var gulp = require("gulp");
var babel = require("gulp-babel");
var mocha = require("gulp-mocha");
var del = require("del");

async function clean(cb) {
    del("lib", cb);
}

async function build() {
    return gulp.src("src/**/*.js").pipe(babel()).pipe(gulp.dest("lib"));
}

async function test() {
    console.log("hi");
}

function preview() {
    var buildReporterPlugin =
        require("testcafe").embeddingUtils.buildReporterPlugin;
    var pluginFactory = require("./lib");
    var reporterTestCalls = require("./test/utils/reporter-test-calls");
    var plugin = buildReporterPlugin(pluginFactory);

    console.log();

    reporterTestCalls.forEach(function (call) {
        plugin[call.method].apply(plugin, call.args);
    });

    process.exit(0);
}

exports.clean = clean;
exports.test = gulp.series(clean, build, test);
exports.build = gulp.series(clean, build);
exports.preview = gulp.series(clean, build, preview);
