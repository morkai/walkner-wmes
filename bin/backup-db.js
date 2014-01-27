'use strict';

var startTime = Date.now();

var format = require('util').format;
var exec = require('child_process').exec;
var config = require(process.argv[2]);

clean(dump);

function clean(next)
{
  exec(format('rmdir /S /Q "%s"', config.backupPath), function(err)
  {
    if (err)
    {
      console.error("Failed to clean the dump: %s", err.message);
    }
    else
    {
      console.log("Cleaned the dump in %s ms!", Date.now() - startTime);
    }

    if (next)
    {
      next();
    }
  });
}

function dump()
{
  var cmd = format(
    '"%s" --db "%s" --out "%s"',
    config.mongodumpExe,
    config.dbName,
    config.backupPath
  );

  exec(cmd, function(err)
  {
    if (err)
    {
      console.error("Failed to dump the database: %s", err.message);
      process.exit(1);
    }

    console.log("Dumped the database in %s ms!", Date.now() - startTime);

    pack();
  });
}

function pack()
{
  var now = new Date();
  var date = now.getFullYear()
    + '-' + pad0(now.getMonth() + 1)
    + '-' + pad0(now.getDate())
    + '-' + pad0(now.getHours())
    + '-' + pad0(now.getMinutes())
    + '-' + pad0(now.getSeconds());
  var zipPath = config.backupPath + '-' + date + '.7z';

  var cmd = format('"%s" a -t7z "%s" "%s"', config.zipExe, zipPath, config.backupPath);

  exec(cmd, function(err)
  {
    clean();

    if (err)
    {
      console.error("Failed to pack the dump: %s", err.message);
      process.exit(1);
    }
    else
    {
      console.log("Packed the dump in %s ms!", Date.now() - startTime);
    }
  });
}

function pad0(num)
{
  return (num < 9 ? '0' : '') + num;
}
