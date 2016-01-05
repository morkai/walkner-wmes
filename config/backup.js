/*jshint -W098*/

'use strict';

exports.dbName = 'walkner-wmes';

exports.backupPath = 'C:/backups/dump';

exports.mongodumpExe = 'C:/Program Files/MongoDB/bin/mongodump.exe';

exports.zipExe = 'C:/Program Files/7-Zip/7z.exe';

exports.excludeCollections = function(date)
{
  return [];
};
