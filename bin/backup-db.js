// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {format} = require('util');
const {execSync} = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require(process.argv[2]);

let startTime = new Date();

console.log("Removing old dump directory: %s...", config.backupPath);

try
{
  execSync(format('rmdir /S /Q "%s"', config.backupPath));
}
catch (err) {} // eslint-disable-line no-empty

console.log("Removing old backup files...");

const backupRootPath = path.dirname(config.backupPath);
const oldBackupFiles = fs.readdirSync(backupRootPath)
  .map(file =>
  {
    const matches = file.match(/^dump-([0-9]{4})-([0-9]{2})-([0-9]{2})-([0-9]{2})-([0-9]{2})-([0-9]{2})/);

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
  .filter(file => !!file)
  .sort((a, b) => a.time - b.time);

for (let i = 0, l = oldBackupFiles.length - 3; i < l; ++i)
{
  const oldBackupFile = oldBackupFiles[i];

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

const minDate = typeof config.minDate === 'function'
  ? config.minDate(startTime)
  : config.minDate;

let excludeCollections = typeof config.excludeCollections === 'function'
  ? config.excludeCollections(startTime)
  : config.excludeCollections;

if (!Array.isArray(excludeCollections))
{
  excludeCollections = [];
}

const fullyExcludedCollections = [].concat(excludeCollections);

if (!config.minCollections)
{
  config.minCollections = {};
}

const minCollections = typeof config.minCollections === 'function'
  ? config.minCollections(startTime)
  : config.minCollections;

Object.keys(minCollections).forEach(collection =>
{
  if (!excludeCollections.includes(collection))
  {
    excludeCollections.push(collection);
  }
});

let dumpCmd = format(
  '"%s" --db "%s" --out "%s"',
  config.mongodumpExe,
  config.dbName,
  config.backupPath
);

if (config.user)
{
  dumpCmd += format(
    ' -u "%s" -p "%s" --authenticationDatabase "%s"',
    config.user,
    config.pass,
    config.authDb
  );
}

const dumpCmds = [dumpCmd];

if (config.user)
{
  dumpCmds[0] += ' --dumpDbUsersAndRoles';
}

excludeCollections.forEach(collectionName =>
{
  dumpCmds[0] += format(' --excludeCollection "%s"', collectionName);
});

Object.keys(minCollections).forEach(collection =>
{
  if (fullyExcludedCollections.includes(collection))
  {
    return;
  }

  const dateProperty = minCollections[collection];
  const query = JSON.stringify({
    [dateProperty]: {
      $gte: {
        $date: {
          $numberLong: minDate.toString()
        }
      }
    }
  }).replace(/"/g, '\\"');

  dumpCmds.push(`${dumpCmd} --collection ${collection} --query "${query}"`);
});

console.log("Dumping the database...");

startTime = new Date();

dumpCmds.forEach(dumpCmd =>
{
  try
  {
    console.log(dumpCmd);
    execSync(dumpCmd);
  }
  catch (err)
  {
    console.log("Failed to dump: %s", err.message);
    process.exit(1); // eslint-disable-line no-process-exit
  }
});

console.log("...done in %ss", (Date.now() - startTime) / 1000);

startTime = new Date();

const date = startTime.getFullYear()
  + '-' + pad0(startTime.getMonth() + 1)
  + '-' + pad0(startTime.getDate())
  + '-' + pad0(startTime.getHours())
  + '-' + pad0(startTime.getMinutes())
  + '-' + pad0(startTime.getSeconds());
const archivePath = config.backupPath + '-' + date + '.7z';

console.log("Packing to: %s...", archivePath);

try
{
  execSync(format('"%s" a -p"%s" -t7z "%s" "%s"', config.zipExe, config.zipPassword, archivePath, config.backupPath));
}
catch (err)
{
  console.log("Failed to pack: %s", err.message);
  process.exit(1); // eslint-disable-line no-process-exit
}

if (config.gdriveParentId)
{
  console.log("Uploading to gdrive...");

  execSync(
    `"${config.gdriveExe}" upload -p "${config.gdriveParentId}" "${archivePath}"`,
    config.gdriveExecOptions || {}
  );
}

if (config.oneDrivePath)
{
  console.log("Copying to OneDrive...");

  execSync(`COPY "${archivePath}" "${path.join(config.oneDrivePath, date)}.7z"`);
}

console.log("...done in %ss", (Date.now() - startTime) / 1000);

console.log("Removing new dump directory...", config.backupPath);

try
{
  execSync(format('rmdir /S /Q "%s"', config.backupPath));
}
catch (err) {} // eslint-disable-line no-empty

function pad0(num)
{
  return (num < 10 ? '0' : '') + num;
}
