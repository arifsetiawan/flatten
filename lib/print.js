'use strict';

var fs = require('fs');
var path = require('path');

var colors = require('colors');

/**
 * Print first level node_modules
 *
 * @param {String} dir Directory name
 * @param {Function} callback return status
 */
module.exports = function(dir, callback) {

  var resolvedDir = path.resolve(dir);

  var nodeModulesDir = path.join(resolvedDir, 'node_modules');
  console.log(nodeModulesDir);
  fs.readdir(nodeModulesDir, function(err, list) {
    if (err) {
      callback(err);
    }
    else {
      
      var dependencies = {};
      list.forEach(function(file) {
        file = path.join(resolvedDir, 'node_modules', file, 'package.json');
        if (fs.existsSync(file)) {
          var packageJson = require(file);
          dependencies[packageJson.name] = packageJson.version;
        }
      })

      var d = {
        dependencies : dependencies
      }
      console.log(JSON.stringify(d, null, 2));

      callback(null, 'print node_modules complete'.green);
    }
  })
}