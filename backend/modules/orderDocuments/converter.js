// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs-extra');
const {exec, execFile} = require('child_process');
const step = require('h5.step');

module.exports = function setUpOrderDocumentsConverter(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const OrderDocumentUpload = mongoose.model('OrderDocumentUpload');

  let converting = false;

  app.broker.subscribe('app.started', convertNext).setLimit(1);
  app.broker.subscribe('orderDocuments.tree.filesUploaded', convertNext);

  function convertNext()
  {
    if (converting)
    {
      return;
    }

    const startTime = Date.now();

    converting = true;

    step(
      function findNextStep()
      {
        const conditions = {count: {$lt: 2}};
        const update = {$inc: {count: 1}};
        const options = {new: true, sort: {count: 1}};

        OrderDocumentUpload.findOneAndUpdate(conditions, update, options, this.next());
      },
      function ensureDirStep(err, todo)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!todo)
        {
          return this.skip();
        }

        module.debug(`[converter] Start hash=[${todo._id}] nc15=${todo.nc15} count=${todo.count}...`);

        this.todo = todo;
        this.tmpDirPath = path.join(module.config.uploadedPath, '.tmp');
        this.sourcePdfPath = path.join(this.tmpDirPath, todo._id);
        this.targetDirPath = path.join(module.config.uploadedPath, todo.nc15, todo._id);
        this.targetPdfPath = path.join(this.targetDirPath, `${todo.nc15}.pdf`);

        fs.pathExists(this.sourcePdfPath, this.next());
      },
      function ensureDirStep(err, sourcePdfExists)
      {
        if (err || !sourcePdfExists)
        {
          return this.skip(null, true);
        }

        fs.ensureDir(this.targetDirPath, this.next());
      },
      function convertToPngStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        convertToPng(
          this.targetDirPath,
          this.sourcePdfPath,
          this.todo.nc15,
          this.next()
        );
      },
      function convertToWebpStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        convertToWebp(
          this.targetDirPath,
          this.todo.nc15,
          this.next()
        );
      },
      function extractTextStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        extractText(
          this.targetDirPath,
          this.sourcePdfPath,
          this.next()
        );
      },
      function movePdfStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        fs.move(this.sourcePdfPath, this.targetPdfPath, this.next());
      },
      function moveMetaStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        fs.move(
          path.join(this.targetDirPath, '.meta.json'),
          path.join(this.targetDirPath, 'meta.json'),
          this.next()
        );
      },
      function(err, tryNext)
      {
        if (err)
        {
          fs.emptyDir(
            this.targetDirPath,
            () => fs.copy(this.sourcePdfPath, this.targetPdfPath, () => {})
          );

          module.error(`[converter] Failed to convert: ${err.message}`);

          converting = false;

          setTimeout(convertNext, 10000);
        }
        else if (this.todo)
        {
          fs.remove(this.sourcePdfPath, () => {});

          module.debug(
            `[converter] Done hash=[${this.todo._id}] nc15=${this.todo.nc15} in ${Date.now() - startTime} ms!`
          );

          this.todo.remove(err =>
          {
            if (err)
            {
              module.error(`[converter] Failed to remove: ${this.todo._id}`);
            }

            converting = false;

            setImmediate(convertNext);
          });
        }
        else
        {
          converting = false;

          if (tryNext)
          {
            setImmediate(convertNext);
          }
        }
      }
    );
  }

  function convertToPng(targetPath, pdfPath, nc15, done)
  {
    const metadata = {
      title: '',
      pageCount: 0
    };

    step(
      function emptyDirStep()
      {
        fs.emptyDir(targetPath, this.next());
      },
      function extractMetadataStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        exec(`"${module.config.exiftoolExe}" -Title -PageCount "${pdfPath}"`, this.next());
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

        fs.writeFile(path.join(targetPath, '.meta.json'), JSON.stringify(metadata), this.next());
      },
      function convertToPngStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        exec(
          `java -Xmx1000M -jar "${module.config.pdfboxAppJar}" PDFToImage -format png -dpi 144 -prefix "${nc15}_" "${pdfPath}"`,
          {cwd: targetPath},
          this.next()
        );
      },
      done
    );
  }

  function convertToWebp(targetPath, nc15, done)
  {
    step(
      function readDirStep()
      {
        fs.readdir(targetPath, this.next());
      },
      function convertToWebpStep(err, files)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.files = files.filter(f => /\.(jpg|png)$/.test(f)).map(f => ({
          jpeg: path.join(targetPath, f),
          webp: path.join(targetPath, f).replace(/\.(jpg|png)/, '.webp')
        }));

        this.files.forEach(f => exec(
          `"${module.config.cwebpExe}" -q 75 "${f.jpeg}" -o "${f.webp}"`,
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
      done
    );
  }

  function extractText(targetPath, pdfPath, done)
  {
    step(
      function()
      {
        fs.readFile(path.join(targetPath, '.meta.json'), 'utf8', this.next());
      },
      function(err, meta)
      {
        if (err)
        {
          return this.skip(err);
        }

        try
        {
          this.meta = JSON.parse(meta);
        }
        catch (err)
        {
          return this.skip(err);
        }

        execFile(process.execPath, [path.join(__dirname, 'extractText.js'), pdfPath], this.next());
      },
      function(err, data)
      {
        if (err)
        {
          return this.skip(err);
        }

        try
        {
          const json = JSON.parse(data);

          if (!this.meta.title)
          {
            this.meta.title = json.meta.Title;
          }

          this.meta.pages = json.pages;
        }
        catch (err)
        {
          return this.skip(err);
        }

        fs.writeFile(path.join(targetPath, '.meta.json'), JSON.stringify(this.meta), this.next());
      },
      done
    );
  }
};
