// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var format = require('util').format;
var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');
var config = require(process.argv[2]);
var startTime = new Date();

console.log("Removing old dump directory: %s...", config.backupPath);

try
{
  execSync(format('rmdir /S /Q "%s"', config.backupPath));
}
catch (err) {}

console.log("Removing old backup files...");

var backupRootPath = path.dirname(config.backupPath);
var oldBackupFiles = fs.readdirSync(backupRootPath)
  .map(function(file)
  {
    var matches = file.match(/^dump-([0-9]{4})-([0-9]{2})-([0-9]{2})-([0-9]{2})-([0-9]{2})-([0-9]{2})/);

    if (matches)
    {
      return {
        name: file,
        path: path.join(backupRootPath, file),
        time: new Date(+matches[1], +matches[2] - 1, +matches[3], +matches[4], +matches[5], +matches[6], 0)
      };
    }

    return null;
  })
  .filter(function(file)
  {
    return !!file;
  })
  .sort(function(a, b)
  {
    return a.time - b.time;
  });

for (var i = 0, l = oldBackupFiles.length - 3; i < l; ++i)
{
  var oldBackupFile = oldBackupFiles[i];

  console.log("...%s", oldBackupFile.name);

  try
  {
    fs.unlinkSync(oldBackupFile.path);
  }
  catch (err)
  {
    console.log("Failed to remove old backup file: %s", err.message);
  }
}

var excludeCollections = typeof config.excludeCollections === 'function'
  ? config.excludeCollections(startTime)
  : config.excludeCollections;

if (!Array.isArray(excludeCollections))
{
  excludeCollections = [];
}

var dumpCmd = format(
  '"%s" --db "%s" --out "%s"',
  config.mongodumpExe,
  config.dbName,
  config.backupPath
);

excludeCollections.forEach(function(collectionName)
{
  dumpCmd += format(' --excludeCollection "%s"', collectionName);
});

console.log("Dumping the database...");
console.log(dumpCmd);

startTime = new Date();

try
{
  execSync(dumpCmd);
}
catch (err)
{
  process.exit(1);
}

console.log("...done in %ss", (Date.now() - startTime) / 1000);

startTime = new Date();

var date = startTime.getFullYear()
  + '-' + pad0(startTime.getMonth() + 1)
  + '-' + pad0(startTime.getDate())
  + '-' + pad0(startTime.getHours())
  + '-' + pad0(startTime.getMinutes())
  + '-' + pad0(startTime.getSeconds());
var archivePath = config.backupPath + '-' + date + '.7z';

console.log("Packing to: %s...", archivePath);

try
{
  execSync(format('"%s" a -t7z "%s" "%s"', config.zipExe, archivePath, config.backupPath));
}
catch (err)
{
  console.log("Failed to pack: %s", err.message);
  process.exit(1);
}

console.log("...done in %ss", (Date.now() - startTime) / 1000);

console.log("Removing new dump directory...", config.backupPath);

try
{
  execSync(format('rmdir /S /Q "%s"', config.backupPath));
}
catch (err) {}

function pad0(num)
{
  return (num < 10 ? '0' : '') + num;
}
