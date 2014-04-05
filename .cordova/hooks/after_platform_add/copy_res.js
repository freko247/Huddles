#!/usr/bin/env node

//
// This hook copies various resource files
// from our version control system directories
// into the appropriate platform specific location
//


// configure all the files to copy.
// Key of object is the source file,
// value is the destination location.
// It's fine to put all platforms' icons
// and splash screen files here, even if
// we don't build for all platforms
// on each developer's box.

var filestocopy = [{
    "www/img/logo.png": "platforms/android/res/drawable/icon.png"
}, {
    "www/res/icon/android/icon-72-hdpi.png": "platforms/android/res/drawable-hdpi/icon.png"
}, {
    "www/res/icon/android/icon-36-ldpi.png": "platforms/android/res/drawable-ldpi/icon.png"
}, {
    "www/res/icon/android/icon-48-mdpi.png": "platforms/android/res/drawable-mdpi/icon.png"
}, {
    "www/res/icon/android/icon-96-xhdpi.png": "platforms/android/res/drawable-xhdpi/icon.png"
}, {
    "www/res/screen/android/screen-mdpi-portrait.png": "platforms/android/res/drawable/splash.png"
}, {
    "www/res/screen/android/screen-hdpi-portrait.png": "platforms/android/res/drawable-hdpi/splash.png"
}, {
    "www/res/screen/android/screen-ldpi-portrait.png": "platforms/android/res/drawable-ldpi/splash.png"
}, {
    "www/res/screen/android/screen-mdpi-portrait.png": "platforms/android/res/drawable-mdpi/splash.png"
}, {
    "www/res/screen/android/screen-xhdpi-portrait.png": "platforms/android/res/drawable-xhdpi/splash.png"
}, ];

var fs = require('fs');
var path = require('path');

// no need to configure below
var rootdir = process.cwd();

filestocopy.forEach(function(obj) {
    Object.keys(obj).forEach(function(key) {
        var val = obj[key];
        var srcfile = path.join(rootdir, key);
        var destfile = path.join(rootdir, val);
        console.log("copying " + srcfile + " to " + destfile);
        var destdir = path.dirname(destfile);
        if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
            fs.createReadStream(srcfile).pipe(
                fs.createWriteStream(destfile));
        }
    });
});