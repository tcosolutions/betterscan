({
    out: "../../optimized/static/js/boot.min.js",
    mainConfigFile : "config.js",
    generateSourceMaps: true,
    removeCombined : true,
    optimize: 'uglify2',
    skipDirOptimize : true,
    fileExclusionRegExp: /^\./,
    preserveLicenseComments : false,
    name: "boot",
    paths: {}
})
