'use strict';

exports.dbName = 'walkner-wmes';

exports.user = null;

exports.pass = null;

exports.authDb = null;

exports.backupPath = 'C:/backups/dump';

exports.mongodumpExe = 'C:/Program Files/MongoDB/bin/mongodump.exe';

exports.zipExe = 'C:/Program Files/7-Zip/7z.exe';

exports.zipPassword = 'TOPSECRET';

exports.gdriveExe = 'gdrive-windows-x64.exe';

exports.gdriveParentId = '0000000000000000000000000000';

exports.gdriveExecOptions = {};

exports.excludeCollections = function(date) // eslint-disable-line no-unused-vars
{
  return [];
};
