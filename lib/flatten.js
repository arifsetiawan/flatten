'use strict';

var fs = require('fs');
var path = require('path');

var semver = require('semver');
var colors = require('colors');
var wrench = require('wrench');

/**
 * Flatten node_modules
 * 
 * Get all package.json, find and delete duplicates
 *
 * @param {String} dir Directory name
 * @param {Object} options Options available: info and verbose. verbose is always true 
 * @param {Function} callback return status
 */
module.exports = function(dir, options, callback) {
  
  options.verbose = true;

  var resolvedDir = path.resolve(dir);

  if (options.verbose) {
    console.log('processing directory ' + resolvedDir.green);
  }
  
  if (fs.existsSync(resolvedDir)) {

    // find modules
    walkModules(resolvedDir, function(err, modules) {
      if (err) return callback(err);
      else {
        
        if (options.verbose) {
          console.log('there are', colors.cyan(modules.length), 'total packages');
        }

        var seenData = [];
        var duplicateData = [];
        var moduleCount = {};
        
        // for each package
        for (var i = 0; i < modules.length; i++) {

          // get package information
          var currentData = {};
          currentData.dir = path.dirname(modules[i]);
          currentData.dirname = path.basename(currentData.dir);

          var occurence = countOccurence(currentData.dir.split(path.sep));
          currentData.nodeModulesCount = occurence.node_modules;
          moduleCount[currentData.nodeModulesCount] = (moduleCount[currentData.nodeModulesCount] || 0) + 1

          try {
            var packageJson = require(modules[i]);
            currentData.name = packageJson.name || currentData.dirname;
            currentData.version = packageJson.version || '0.0.0';
            if(typeof(currentData.name) === 'undefined')
              continue;
              //throw 'Name is not specified in ' + modules[i];
            if(typeof(currentData.version) === 'undefined')
              continue;
              //throw 'Version is not specified in ' + modules[i];
          }
          catch(err) {
            return callback(err);
          }

          console.log('processing ' + currentData.name + ' ver. ' + currentData.version + ' in ' + currentData.dir);

          // start acculumate seen and duplicate
          if (seenData.length == 0) {
            seenData.push(currentData);
          }
          else {

            var currentExist = false;
            var currentExistIndex = -1;
            var currentExistData = {};
            for (var j = 0; j < seenData.length; j++) {

              if (seenData[j].name === currentData.name) {
                currentExist = true;
                currentExistIndex = j;
                currentExistData = seenData[j];
                break;
              }
            }

            if (!currentExist) {
              seenData.push(currentData);
            }
            else {
              if (options.verbose) {
                console.log(' duplicate:'.magenta, currentData.name, currentData.version.cyan, 'existing version:', currentExistData.version.cyan);
              }

              // if seen version is older, swap seen with most current version
              if (semver.lt(currentExistData.version,currentData.version)) {
                if (options.verbose) {
                  console.log('  ', currentData.name, 'existing version is older. do swap');
                }
                seenData[currentExistIndex] = currentData;
                duplicateData.push(currentExistData);
              }
              else {
                duplicateData.push(currentData);  
              }
            }
          }
        }

        if (options.verbose) {
          console.log('node_modules iteration complete'.green);
          console.log('there are', colors.cyan(seenData.length), 'unique packages');
          console.log('         ', colors.cyan(duplicateData.length), 'duplicate packages');
          for (var key in moduleCount) {
            var str = key == 1 ? 'there are' : '         ';
            console.log(str, colors.cyan(moduleCount[key]), 'packages in node_modules level', colors.cyan(key));
          }
        }

        if (options.info) {
          callback(null, 'node_modules info complete'.green);  
        }
        else {

          try {

            // move seen packages if its in deeper level to first level
            for (var k = 0; k < seenData.length; k++) {
              if (seenData[k].nodeModulesCount > 1) {
                if (options.verbose) {
                  var copyDestination = path.join(resolvedDir, 'node_modules', seenData[k].dirname);
                  console.log('moving directory'.cyan, seenData[k].dir, 'to'.cyan, copyDestination);
                  wrench.copyDirSyncRecursive(seenData[k].dir, copyDestination, { forceDelete: true });
                }
              }
            }

            // re-walk the node_modules and delete all node_modules in deeper level
            var nodeModulesDir = path.join(resolvedDir, 'node_modules');
            fs.readdir(nodeModulesDir, function(err, list) {
              if (err) {
                callback(err);
              }
              else {
                list.forEach(function(file) {
                  file = path.join(resolvedDir, 'node_modules', file);
                  var stat = fs.statSync(file);
                  if (stat && stat.isDirectory()) {
                    var deeperNodeModulesDir = path.join(file, 'node_modules');
                    if (fs.existsSync(deeperNodeModulesDir)) {
                      if (options.verbose) {
                        console.log('deleting directory'.magenta, deeperNodeModulesDir);
                      }
                      wrench.rmdirSyncRecursive(deeperNodeModulesDir, true);
                    }
                  }
                })

                callback(null, 'flatten node_modules complete'.green);
              }
            })
          }
          catch(err) {
            callback(err);
          }
        }
      }
    });
  }
  else {
    callback(new Error('Specified directory ' + dir + ' is not exists!'))
  }
}

/**
 * Walk module folder
 *
 * Find folder node_modules, scan its folders, find package.json and store it, recursively
 * 
 * @param {String} dir Directory name
 * @param {Function} done this will contains array of package.json file
 */
function walkModules(dir, done) {

  var results = [];

  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);

    list.forEach(function(file) {
      file = dir + path.sep + file;

      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {

          if (file.indexOf('node_modules') > -1) {
            walkModules(file, function(err, res) {
              results = results.concat(res);
              if (!--pending) done(null, results);
            });
          }
          else {
            if (!--pending) done(null, results);
          }

        } else {

          if (file.slice(-12) === 'package.json') {
            var parts = file.split(path.sep);
            if (parts[parts.length-3] === 'node_modules') {
              results.push(file);
            }
          }
          
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

/**
 * Count occurance in array
 * 
 * @param {Array} arr Array of items
 */
function countOccurence(arr) {
  var obj = { };
  for (var i = 0, j = arr.length; i < j; i++) {
    obj[arr[i]] = (obj[arr[i]] || 0) + 1
  }
  return obj;
}