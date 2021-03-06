"use strict";
var config, minimatch, fs, wrench, win32, path, pathSeparator, registration, normalize, windowsDrive, wrench, _appendFilesToInclude,
  __slice = [].slice,
  requireModule = null;

path = require('path');

fs = require('fs');

wrench = require("wrench");

config = require('./config');

minimatch = require('minimatch');;

windowsDrive = /^[A-Za-z]:\\/;

win32 = process.platform === 'win32';

pathSeparator = win32 ? '\\' : '/';

normalize = function (filepath) {
  return win32 ? filepath.replace(/\\/g, '/') : filepath;
};

registration = function(mimosaConfig, register) {
  var e;

  if (mimosaConfig.isOptimize) {
    requireModule = mimosaConfig.installedModules["mimosa-require"]
    e = mimosaConfig.extensions;
    register(['add', 'update', 'remove'], 'beforeOptimize', _appendFilesToInclude, __slice.call(e.javascript).concat(__slice.call(e.template)));
    return register(['postBuild'], 'beforeOptimize', _appendFilesToInclude);
  }
};

function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
}

_appendFilesToInclude = function(mimosaConfig, options, next) {
  var hasPatterns, hasRunConfigs, _ref;

  hasRunConfigs = ((_ref = options.runConfigs) != null ? _ref.length : void 0) > 0;
  if (!hasRunConfigs) {
    return next();
  }
  hasPatterns = mimosaConfig.requireBuildInclude.patterns.length > 0;

  if (!hasPatterns) {
    return next();
  }

  options.runConfigs.forEach(function(runConfig) {
    var files, includeFolder;

    includeFolder = mimosaConfig.requireBuildInclude.folder || runConfig.baseUrl;

    mimosaConfig.requireBuildInclude.patterns.forEach(function (pattern) {
      var base, absPattern;

      base = normalize(path.join(includeFolder, pathSeparator));
      absPattern = normalize(path.resolve(base, pattern));

      files = wrench.readdirSyncRecursive(includeFolder)
        .map(function(file) {
          return path.join(includeFolder, file);
        })
        .filter(function(file) {
          return fs.statSync(file).isFile();
        })
        .filter(function(file) {
          return mimosaConfig.requireBuildInclude.exclude.indexOf(file) == -1
        })
        .filter(function(file) {
          if (mimosaConfig.requireBuildInclude.excludeRegex && file.match(mimosaConfig.requireBuildInclude.excludeRegex)) {
            return false
          } else {
            return true
          }
        })
        .map(normalize)
        .filter(function(file) {
          return minimatch(file, absPattern);
        });

      return files.forEach(function(file) {
        // Check with mimosa-require to see if path has been aliased, if so
        // alias must be used
        var fileAMD = requireModule.manipulatePathWithAlias(file);

        // If no alias replacement, get relative url/amd path to file
        if (fileAMD === file) {
          fileAMD = path.relative(runConfig.baseUrl, file);
        }

        // Proper slashes and remove extension
        fileAMD = fileAMD.split(path.sep).join("/").replace(getExtension(file), '');
        return runConfig.include.push(fileAMD);
      });
    });
  });

  next();
};

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate
};