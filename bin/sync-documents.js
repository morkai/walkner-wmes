'use strict';

const EventEmitter = require('events').EventEmitter;
const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs-extra');
const step = require('h5.step');
const config = require(process.argv[2] || __filename.replace(/.js$/, '.config.json'));

function readDirs(initialPath, options)
{
  if (!options)
  {
    options = {};
  }

  if (typeof options.filter !== 'function')
  {
    options.filter = function() { return true; };
  }

  if (typeof options.isFile !== 'function')
  {
    options.isFile = function() { return false; };
  }

  const ee = new EventEmitter();
  const queue = [initialPath];
  let opsInProgress = 0;
  let finished = false;
  let endTimer = null;

  setImmediate(readNext);

  return ee;

  function end(err, src)
  {
    if (finished)
    {
      return;
    }

    if (endTimer !== null)
    {
      clearTimeout(endTimer);
      endTimer = null;
    }

    if (err)
    {
      finished = true;

      ee.emit('error', err);
      ee.emit('end');
    }
    else
    {
      endTimer = setTimeout(function()
      {
        finished = true;

        ee.emit('end', src);
      }, 1337);
    }
  }

  function readNext()
  {
    if (queue.length === 0)
    {
      return end(null);
    }

    ++opsInProgress;

    const dirPath = queue.shift();

    fs.readdir(dirPath, function(err, files)
    {
      --opsInProgress;

      if (err)
      {
        return end(err);
      }

      for (let i = 0; i < files.length; ++i)
      {
        statFile(dirPath, files[i]);
      }
    });
  }

  function statFile(dirPath, fileName)
  {
    const filePath = path.join(dirPath, fileName);

    ++opsInProgress;

    fs.stat(filePath, function(err, stats)
    {
      --opsInProgress;

      if (err)
      {
        return end(err);
      }

      if (options.filter(stats, fileName, dirPath, filePath))
      {
        if (stats.isDirectory())
        {
          ee.emit('dir', fileName, dirPath, filePath, stats);

          queue.push(filePath);
        }
        else if (stats.isFile())
        {
          ee.emit('file', fileName, dirPath, filePath, stats);
        }
      }

      setImmediate(readNext);
    });
  }
}

module.exports = function(output, done)
{
  const nc15ToFileMap = {};
  let startedAt = Date.now();

  output("Building documents list...");

  const dirs = readDirs(config.sourcePath, {
    isFile: function(fileName)
    {
      return /^\s*[0-9]{12,15}.*?\.pdf$/i.test(fileName);
    },
    filter: function(stats, fileName, dirPath, filePath)
    {
      if (stats.isDirectory())
      {
        if (/Centrum produkcji/.test(fileName))
        {
          return true;
        }

        return /Centrum produkcji.*?Monta/.test(filePath);
      }
      else if (stats.isFile())
      {
        return this.isFile(fileName, dirPath, filePath);
      }

      return false;
    }
  });

  dirs.on('file', function(fileName, dirPath, filePath, stats)
  {
    let nc15 = fileName.match(/([0-9]{12,15})/)[1];

    while (nc15.length < 15)
    {
      nc15 = '0' + nc15;
    }

    if (!nc15ToFileMap[nc15])
    {
      nc15ToFileMap[nc15] = [];
    }

    nc15ToFileMap[nc15].push({
      path: filePath,
      time: Math.max(stats.ctime.getTime(), stats.mtime.getTime())
    });
  });

  dirs.on('error', function(err)
  {
    console.error(err.message);
  });

  dirs.on('end', function()
  {
    output(` finished in ${((Date.now() - startedAt) / 1000).toFixed(3)}s!\r\n`);

    output('Picking the latest documents...');

    startedAt = Date.now();

    const nc15s = Object.keys(nc15ToFileMap);

    nc15s.forEach(function(nc15)
    {
      let latest = {path: '?', time: 0};

      nc15ToFileMap[nc15].forEach(function(candidate)
      {
        if (candidate.time > latest.time)
        {
          latest = candidate;
        }
      });

      nc15ToFileMap[nc15] = latest.path;
    });

    output(` finished in ${((Date.now() - startedAt) / 1000).toFixed(3)}s!\r\n`);
    output('Saving documents list to sync.json...');

    startedAt = Date.now();

    fs.writeFileSync(__filename + 'on', JSON.stringify(nc15ToFileMap, null, 2));

    output(` finished in ${((Date.now() - startedAt) / 1000).toFixed(3)}s!\r\n`);
    output('Syncing documents...\r\n');

    startedAt = Date.now();

    syncNext(nc15s, nc15s.length, 0);
  });

  function syncNext(nc15s, todoCount, doneCount)
  {
    const nc15 = nc15s.shift();

    if (!nc15)
    {
      output(`...finished in ${((Date.now() - startedAt) / 1000).toFixed(3)}s!\r\n`);

      return done();
    }

    output(nc15 + '... ');

    const sourcePath = nc15ToFileMap[nc15];
    const targetPath = path.join(config.targetPdfPath, nc15 + '.pdf');

    step(
      function statFilesStep()
      {
        output('stat... ');

        fs.stat(sourcePath, this.parallel());
        fs.stat(targetPath, this.parallel());
      },
      function compareMtimeStep(err, sourceStats, targetStats)
      {
        if (!sourceStats)
        {
          output(' 404... ');

          return this.skip();
        }

        if (targetStats)
        {
          sourceStats.mtime.setMilliseconds(0);
          targetStats.mtime.setMilliseconds(0);

          const sourceTime = sourceStats.mtime.getTime();
          const targetTime = targetStats.mtime.getTime();

          if (sourceStats.mtime.getTime() === targetStats.mtime.getTime())
          {
            output('same... ');

            return this.skip();
          }
          else
          {
            output(sourceTime + ' vs ' + targetTime + '...');
          }
        }

        output('copy... ');

        this.sourceStats = sourceStats;

        copyFile(sourcePath, targetPath, this.next());
      },
      function changeTargetTimesStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        output('time... ');

        fs.utimes(targetPath, this.sourceStats.atime, this.sourceStats.mtime, this.next());

        this.sourceStats = null;
      },
      function convertToJpegStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        convertToJpeg(output, nc15, targetPath, this.next());
      },
      function convertToWebpStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        convertToWebp(output, nc15, this.next());
      },
      function finalizeStep(err)
      {
        ++doneCount;

        if (err)
        {
          output(`error: ${err.message}\r\n`);
        }
        else
        {
          output(`done ${doneCount}/${todoCount} (${(doneCount / todoCount * 100).toFixed(4)}%)!\r\n`);
        }

        setImmediate(syncNext, nc15s, todoCount, doneCount);
      }
    );
  }
};

function copyFile(source, target, done)
{
  let finalized = false;

  const readStream = fs.createReadStream(source);
  readStream.on('error', finalize);

  const writeStream = fs.createWriteStream(target);
  writeStream.on('error', finalize);
  writeStream.on('close', () => finalize());

  readStream.pipe(writeStream);

  function finalize(err)
  {
    if (!finalized)
    {
      finalized = true;

      done(err);
    }
  }
}

function convertToJpeg(output, nc15, pdfPath, done)
{
  const jpegsPath = path.join(config.targetJpegPath, nc15);
  const metadata = {
    title: '',
    pageCount: 0
  };

  step(
    function emptyJpegsDirStep()
    {
      fs.emptyDir(jpegsPath, this.next());
    },
    function extractMetadataStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      output('meta... ');

      exec(`"${config.exiftoolExe}" -Title -PageCount "${pdfPath}"`, this.next());
    },
    function writeMetadataStep(err, stdout)
    {
      if (err)
      {
        return this.skip(err);
      }

      let matches = stdout.match(/Title\s*:(.*?)\r\n/i);

      if (matches)
      {
        metadata.title = matches[1].trim();
      }

      matches = stdout.match(/Page Count\s*:(.*?)\r\n/i);

      if (matches)
      {
        metadata.pageCount = parseInt(matches[1].trim(), 10);
      }

      fs.writeFile(path.join(jpegsPath, 'meta.json'), JSON.stringify(metadata), this.next());
    },
    function convertToJpegStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      output('jpeg... ');

      exec(
        `"${config.sejdaConsoleExe}" pdftojpeg -r 144 -j overwrite -f "${pdfPath}" -o "${jpegsPath}"`,
        this.next()
      );
    },
    function finalizeStep(err)
    {
      if (err)
      {
        fs.remove(jpegsPath, () => {});
      }

      done(err);
    }
  );
}


function convertToWebp(output, nc15, done)
{
  const jpegsPath = path.join(config.targetJpegPath, nc15);

  step(
    function readDirStep()
    {
      fs.readdir(jpegsPath, this.next());
    },
    function convertToWebpStep(err, files)
    {
      if (err)
      {
        return this.skip(err);
      }

      output('webp... ');

      this.files = files.filter(f => /\.jpg$/.test(f)).map(f => ({
        jpeg: path.join(jpegsPath, f),
        webp: path.join(jpegsPath, f).replace('.jpg', '.webp')
      }));

      this.files.forEach(f => exec(
        `"${config.cwebpExe}" -q 75 "${f.jpeg}" -o "${f.webp}"`,
        this.group()
      ));
    },
    function removeJpegsStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      this.files.forEach(f => fs.unlink(f.jpeg, this.group()));
    },
    function finalizeStep(err)
    {
      if (err)
      {
        fs.remove(jpegsPath, () => {});
      }

      done(err);
    }
  );
}

if (process.argv[1].toLowerCase() === __filename.toLowerCase())
{
  module.exports(process.stdout.write.bind(process.stdout), () => {});
}
