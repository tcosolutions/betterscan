({
    appDir: "../../",
    dir : "../../optimized",
    mainConfigFile : "config.js",
    baseUrl: "static/js",
    generateSourceMaps: true,
    removeCombined : true,
    optimize: 'uglify2',
    skipDirOptimize : true,
    preserveLicenseComments : false,
    modules: [
      {
        name: "scaffold/settings",
      }
    ],
    paths: {}
})
