// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const _ = require('lodash');
const step = require('h5.step');
const fs = require('fs-extra');
const cheerio = require('cheerio');

exports.DEFAULT_CONFIG = {
  filterRe: /^EMAIL_[0-9]+$/,
  outputDir: './eto',
  parsedOutputDir: null
};

exports.start = function startOrderDocumentsEtoImporterModule(app, module)
{
  const filePathCache = {};
  let locked = false;
  const queue = [];

  app.broker.subscribe('directoryWatcher.changed', queueFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    return !filePathCache[fileInfo.filePath] && module.config.filterRe.test(fileInfo.fileName);
  }

  function queueFile(fileInfo)
  {
    filePathCache[fileInfo.filePath] = true;

    queue.push(fileInfo);

    module.debug('[%s] Queued...', fileInfo.fileName);

    setImmediate(importNext);
  }

  function importNext()
  {
    if (locked)
    {
      return;
    }

    const fileInfo = queue.shift();

    if (!fileInfo)
    {
      return;
    }

    locked = true;

    const startTime = Date.now();

    module.debug('[%s] Importing...', fileInfo.fileName);

    importFile(fileInfo, function(err, nc12)
    {
      if (err || nc12)
      {
        cleanUpFileInfoFile(fileInfo);
      }

      if (err)
      {
        module.error('[%s] Failed to import: %s', fileInfo.fileName, err.message);

        app.broker.publish('orderDocuments.eto.syncFailed', {
          timestamp: fileInfo.timestamp,
          fileName: fileInfo.fileName,
          error: err.message
        });
      }
      else if (nc12)
      {
        module.debug('[%s] Imported %s in %d ms!', fileInfo.fileName, nc12, Date.now() - startTime);

        app.broker.publish('orderDocuments.eto.synced', {
          timestamp: fileInfo.timestamp,
          fileName: fileInfo.fileName,
          nc12: nc12
        });
      }
      else
      {
        module.debug('[%s] Ignored!', fileInfo.fileName);
      }

      locked = false;

      setImmediate(importNext);
    });
  }

  function importFile(fileInfo, done)
  {
    step(
      function readEmailJsonFileStep()
      {
        readEmailJsonFile(path.join(fileInfo.filePath, 'email.json'), 0, this.next());
      },
      function parseEmailJsonStep(err, fileContents)
      {
        if (err)
        {
          return this.skip(err);
        }

        module.debug('[%s] Parsing ~%d bytes of email.json...', fileInfo.fileName, fileContents.length);

        try
        {
          setImmediate(this.next(), null, JSON.parse(fileContents));
        }
        catch (err)
        {
          setImmediate(this.next(), err);
        }
      },
      function handleEmailJsonStep(err, email)
      {
        if (err)
        {
          return this.skip(err);
        }

        const matches = email.subject.match(/ETO.*?([0-9]{12}|[0-9A-Z]{7})/);

        if (!matches)
        {
          return this.skip();
        }

        this.nc12 = matches[1];
        this.email = email;
      },
      function findEtoTableStep()
      {
        const $ = cheerio.load(this.email.body);
        const $tables = $('table');
        let etoTableHtml = null;

        $tables.each(function()
        {
          if (etoTableHtml !== null)
          {
            return;
          }

          const text = $(this).text().replace(/[^0-9a-zA-Z]/g, '').toLowerCase();

          if (_.includes(text, 'wykonanie') && _.includes(text, '12nc'))
          {
            etoTableHtml = $.html(this);
          }
        });

        if (!etoTableHtml)
        {
          return this.skip(new Error('ETO table not found in the e-mail body.'));
        }

        this.etoTableHtml = etoTableHtml;

        setImmediate(this.next());
      },
      function readInlineAttachmentFilesStep()
      {
        this.inlineAttachments = findInlineAttachments(
          this.etoTableHtml,
          mapContentAttachments(this.email.attachments, fileInfo.filePath)
        );

        for (let i = 0; i < this.inlineAttachments.length; ++i)
        {
          fs.readFile(this.inlineAttachments[i].path, this.group());
        }
      },
      function insertInlineAttachmentsStep(err, buffers)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (let i = 0; i < this.inlineAttachments.length; ++i)
        {
          const inlineAttachment = this.inlineAttachments[i];
          const buffer = buffers[i];
          const replacement = 'src="data:' + inlineAttachment.type + ';base64,' + buffer.toString('base64') + '"';

          this.etoTableHtml = this.etoTableHtml.replace(inlineAttachment.pattern, replacement);
        }

        setImmediate(this.next());
      },
      function saveEtoTableHtmlStep()
      {
        fs.writeFile(path.join(module.config.outputDir, this.nc12 + '.html'), this.etoTableHtml, this.next());
      },
      function finalizeStep(err)
      {
        done(err, this.nc12);
      }
    );
  }

  function cleanUpFileInfoFile(fileInfo)
  {
    setTimeout(removeFilePathFromCache, 15000, fileInfo.filePath);

    if (module.config.parsedOutputDir)
    {
      moveFileInfoFile(fileInfo.filePath);
    }
    else
    {
      deleteFileInfoFile(fileInfo.filePath);
    }
  }

  function moveFileInfoFile(oldFilePath)
  {
    const newFilePath = path.join(module.config.parsedOutputDir, path.basename(oldFilePath));

    fs.move(oldFilePath, newFilePath, {overwrite: true}, function(err)
    {
      if (err)
      {
        module.error(
          'Failed to move [%s] to [%s]: %s', oldFilePath, newFilePath, err.message
        );
      }
    });
  }

  function deleteFileInfoFile(filePath)
  {
    fs.remove(filePath, err =>
    {
      if (err)
      {
        module.error('Failed to delete directory [%s]: %s', filePath, err.message);
      }
    });
  }

  function removeFilePathFromCache(filePath)
  {
    delete filePathCache[filePath];
  }

  function readEmailJsonFile(filePath, retry, done)
  {
    if (retry > 10)
    {
      return done(new Error('email.json file not found!'));
    }

    fs.readFile(filePath, {encoding: 'utf8'}, function(err, contents)
    {
      if (err && err.code === 'ENOENT')
      {
        return setTimeout(readEmailJsonFile, 3000, filePath, retry + 1, done);
      }

      done(err, contents);
    });
  }

  function mapContentAttachments(attachments, targetDirPath)
  {
    const contentAttachments = {};

    _.forEach(attachments, function(attachment)
    {
      if (attachment.contentId)
      {
        attachment.path = path.join(targetDirPath, attachment.name);

        contentAttachments[attachment.contentId] = attachment;
      }
    });

    return contentAttachments;
  }

  function findInlineAttachments(html, contentAttachments)
  {
    const inlineAttachments = [];
    const re = /src="cid:(.*?)"/g;
    let match;

    while ((match = re.exec(html)) !== null) // eslint-disable-line no-cond-assign
    {
      const pattern = match[0];
      const contentId = match[1];
      const contentAttachment = contentAttachments[contentId];

      if (contentAttachment)
      {
        inlineAttachments.push({
          path: contentAttachment.path,
          type: contentAttachment.contentType,
          pattern: pattern
        });
      }
    }

    return inlineAttachments;
  }
};
