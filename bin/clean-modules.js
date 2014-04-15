// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

var keepDotBin = true;
var keepBin = false;
var removeFilesMatching = [
  'Makefile', 'Rakefile', 'wscript', 'src', 'ext'
];
var removeFilesStartingWith = [
  'test', 'spec', 'example', 'bench', 'tool', 'te?mp', 'component', 'extra', 'doc', 'source'
];
var removeFilesEndingWith = [
  'txt', 'md', 'html?', 'ico', 'jpe?g', 'gif', 'gyp', 'log', 'watchr'
];

var REMOVE_FILES_STARTING_WITH_RE = new RegExp('^(' + removeFilesStartingWith.join('|') + ')', 'i');
var REMOVE_FILES_ENDING_WITH_RE = new RegExp('(' + removeFilesEndingWith.join('|') + ')$', 'i');

cleanNodeModules('./', '');

function cleanNodeModules(modulePath, parentModules)
{
  var moduleName = path.basename(modulePath);
  var nodeModulesPath = path.join(modulePath, 'node_modules');

  if (parentModules === '')
  {
    parentModules = moduleName;
  }
  else
  {
    parentModules += '/' + moduleName;
  }

  fs.readdirSync(nodeModulesPath).forEach(function(nodeModuleName)
  {
    console.log();

    if (nodeModuleName === '.bin')
    {
      if (keepDotBin)
      {
        console.log("Keeping .bin");
      }
      else
      {
        rm(modulePath, '.bin');
      }

      return;
    }

    cleanModule(nodeModuleName, path.join(nodeModulesPath, nodeModuleName), parentModules);
  });
}

function cleanModule(moduleName, modulePath, parentModules)
{
  console.log("Cleaning module %s/%s...", parentModules, moduleName);

  var hasNestedModules = false;

  fs.readdirSync(modulePath).forEach(function(file)
  {
    if (file === 'lib'
      || /^(package\.json|license|readme)/i.test(file))
    {
      return console.log("Keeping %s...", file);
    }

    if (!keepBin && file === 'bin')
    {
      if (moduleName === 'socket.io-client')
      {
        return console.log("Keeping bin...");
      }

      return rm(modulePath, 'bin');
    }

    if (moduleName === 'jshint' && file === 'src')
    {
      return console.log("Keeping src...");
    }

    if (moduleName === 'moment' && file === 'lang')
    {
      return console.log("Keeping lang...");
    }

    if (file === 'build')
    {
      return cleanBuild(modulePath);
    }

    if (file === 'node_modules')
    {
      hasNestedModules = true;

      return;
    }

    if (file.charAt(0) === '.'
      || removeFilesMatching.indexOf(file) !== -1
      || REMOVE_FILES_STARTING_WITH_RE.test(file)
      || REMOVE_FILES_ENDING_WITH_RE.test(file))
    {
      return rm(modulePath, file);
    }

    if (file.indexOf('.') === -1 && fs.statSync(path.join(modulePath, file)).isFile())
    {
      return rm(modulePath, file);
    }

    return console.log("Ignoring %s...", file);
  });

  if (hasNestedModules)
  {
    cleanNodeModules(modulePath, parentModules);
  }
}

function rm(modulePath, file)
{
  console.log("Removing %s...", file);

  var filePath = path.join(modulePath, file);

  exec('rm -rf "' + filePath + '"', function(err)
  {
    if (err)
    {
      console.error("Failed to remove %s: %s", filePath, err.message);
    }
  });
}

function cleanBuild(modulePath)
{
  console.log("Cleaning build directory...");

  rmNonNodeFiles(path.join(modulePath, 'build'));
}

function rmNonNodeFiles(buildPath)
{
  fs.readdirSync(buildPath).forEach(function(file)
  {
    var filePath = path.join(buildPath, file);

    if (fs.statSync(filePath).isDirectory())
    {
      rmNonNodeFiles(filePath);
    }
    else if (!/\.node$/i.test(file))
    {
      fs.unlink(filePath, function(err)
      {
        if (err)
        {
          console.error("Failed to remove %s: %s", filePath, err.message);
        }
      });
    }
  });
}
