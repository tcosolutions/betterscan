"use strict";
/*JSON reporter module, which will just return a JSON dump of the errors found in a given file*/
module.exports = {
  reporter: function (res) {
    process.stdout.write(JSON.stringify(res,undefined,true));
  }
};