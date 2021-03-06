"use strict";

exports.defaults = function() {
  return {
    requireBuildInclude: {
      folder: null,
      patterns: [],
      exclude:[/-built.js$/,/reload-client.js$/]
    }
  };
};

exports.placeholder = function() {
  return "\t\n\n"+
         "  # requireBuildInclude:            \n" +
         "    # folder: null           # The folder to scan for files to include. This defaults to\n" +
         "                             # the baseUrl of the r.js run config. Folder should be\n" +
         "                             # absolute or relative to the watch.sourceDir.\n" +
         "    # exclude: [/-built.js$/,/reload-client.js$/]   #  a list of regexes or strings used\n" +
         "                             # to match files to be excluded files that match any patterns.\n" +
         "    # patterns: []           # Patters to match files inside 'folder'. Matched files\n" +
         "                             # are added to the 'includes' array of the r.js run.\n";
};

exports.validate = function(config, validators) {
  var errors = [];

  validators.isArrayOfStringsMustExist(errors, "requireBuildInclude.patterns", config.requireBuildInclude.patterns);

  if(validators.ifExistsIsString(errors, "requireBuildInclude.folder", config.requireBuildInclude.folder)) {
    config.requireBuildInclude.folder = validators.multiPathMustExist(errors, "requireBuildInclude.folder", config.requireBuildInclude.folder, config.watch.sourceDir);
    config.requireBuildInclude.folder = config.requireBuildInclude.folder.replace(config.watch.sourceDir, config.watch.compiledDir);
  }

  validators.ifExistsFileExcludeWithRegexAndString(errors, "requireBuildInclude.exclude", config.requireBuildInclude, config.watch.compiledDir);

  return errors;
};