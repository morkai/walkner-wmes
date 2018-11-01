// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const step = require('h5.step');
const JSZip = require('jszip');

module.exports = function setUpGdrive(app, module)
{
  const gdrive = app[module.config.gdriveId];
  const settings = app[module.config.settingsId];
  const mongoose = app[module.config.mongooseId];
  const HelpFile = mongoose.model('HelpFile');

  let downloadQueue = [];
  let downloading = false;

  app.broker.subscribe('app.started').setLimit(1).on('message', () => reloadTree());

  function reloadTree()
  {
    const startTime = Date.now();

    step(
      function()
      {
        listFiles(this.next());
      },
      function(err, files)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to list files: ${err.message}`));
        }

        if (files.length)
        {
          reloadNextFile(files, this.next());
        }
      },
      function(err, changeCount)
      {
        if (err)
        {
          module.error(`Failed to reload tree: ${err.message}`);

          setTimeout(reloadTree, 120000);
        }
        else
        {
          module.debug(`Tree reloaded in ${Date.now() - startTime}ms (${changeCount} changes)!`);

          if (changeCount > 0)
          {
            app.broker.publish('help.tree.reloaded');
          }

          setImmediate(monitorChanges);
        }
      }
    );
  }

  function listFiles(done)
  {
    listNextFiles([], null, done);
  }

  function listNextFiles(allFiles, pageToken, done)
  {
    step(
      function()
      {
        gdrive.authorize(this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to authorize: ${err.message}`));
        }

        const req = {
          corpora: 'user',
          spaces: 'drive',
          fields: 'files(id,name,description,mimeType,parents,properties,version,modifiedTime)',
          orderBy: 'folder,name',
          pageSize: 100
        };

        if (pageToken)
        {
          req.pageToken = pageToken;
        }

        gdrive.drive.files.list(req, this.next());
      },
      function(err, res)
      {
        if (err)
        {
          return done(app.createError(`Failed to list files: ${err.message}`));
        }

        const {nextPageToken, files} = res.data;

        if (nextPageToken)
        {
          listNextFiles(allFiles.concat(files), nextPageToken, done);
        }
        else
        {
          done(null, allFiles.concat(files));
        }
      }
    );
  }

  function reloadNextFile(remainingFiles, done, changeCount)
  {
    if (!changeCount)
    {
      changeCount = 0;
    }

    const file = remainingFiles.shift();
    const newFile = {
      _id: file.id,
      kind: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      mimeType: file.mimeType,
      parents: file.parents || [],
      name: file.name,
      description: file.description || '',
      version: file.version,
      updatedAt: new Date(file.modifiedTime),
      properties: file.properties || {}
    };
    const conditions = {
      _id: newFile._id
    };

    HelpFile.collection.replaceOne(conditions, newFile, {upsert: true}, (err, res) =>
    {
      if (err)
      {
        return done(app.createError(`Failed to update file [${newFile._id}]: ${err.message}`));
      }

      const changed = res.modifiedCount === 1 || res.upsertedCount === 1;

      if (changed)
      {
        changeCount += 1;

        if (newFile.mimeType === 'application/vnd.google-apps.document')
        {
          scheduleFileDownload(newFile._id);
        }

        app.broker.publish('help.files.edited', {model: newFile});
      }

      if (remainingFiles.length)
      {
        return reloadNextFile(remainingFiles, done, changeCount);
      }

      done(null, changeCount);
    });
  }

  function monitorChanges()
  {
    step(
      function()
      {
        settings.findById('help.lastChangesPageToken', this.next());
      },
      function(err, setting)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to get the last changes page token setting: ${err.message}`
          ));
        }

        this.pageToken = setting ? setting.value : '1';

        gdrive.authorize(this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to authorize: ${err.message}`));
        }

        gdrive.drive.changes.list({pageToken: this.pageToken}, this.next());
      },
      function(err, res)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to list changes: ${err.message}`));
        }

        const {newStartPageToken, nextPageToken, changes} = res.data;

        this.newPageToken = nextPageToken || newStartPageToken || this.pageToken;

        handleNextChange(changes, this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to handle changes: ${err.message}`));
        }

        if (this.newPageToken !== this.pageToken)
        {
          settings.update('help.lastChangesPageToken', this.newPageToken, null, this.next());
        }
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to monitor changes: ${err.message}`);

          return setTimeout(monitorChanges, 30000);
        }

        setTimeout(monitorChanges, this.newPageToken === this.pageToken ? 60000 : 1000);
      }
    );
  }

  function handleNextChange(remainingChanges, done, err)
  {
    if (err || !remainingChanges.length)
    {
      return done(err);
    }

    const change = remainingChanges.shift();

    if (change.removed)
    {
      handleRemovedFile(change.fileId, err => handleNextChange(remainingChanges, done, err));
    }
    else
    {
      handleChangedFile(change.fileId, err => handleNextChange(remainingChanges, done, err));
    }
  }

  function handleRemovedFile(fileId, done)
  {
    step(
      function()
      {
        HelpFile.findById(fileId).lean().exec(this.next());
      },
      function(err, helpFile)
      {
        if (err)
        {
          return app.createError(`Failed to find help file [${fileId}]: ${err.message}`);
        }

        this.helpFile = helpFile;

        if (helpFile)
        {
          HelpFile.deleteOne({_id: fileId}, this.next());
        }
      },
      function(err, res)
      {
        if (err)
        {
          return done(app.createError(`Failed to remove file [${fileId}]: ${err.message}`));
        }

        if (res && res.n === 1)
        {
          app.broker.publish('help.files.deleted', {model: this.helpFile});
        }

        done();
      }
    );
  }

  function handleChangedFile(fileId, done)
  {
    step(
      function()
      {
        gdrive.authorize(this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to authorize: ${err.message}`));
        }

        const req = {
          fileId,
          fields: 'id,name,description,mimeType,parents,properties,version,modifiedTime'
        };

        gdrive.drive.files.get(req, this.next());
      },
      function(err, res)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to get file: ${err.message}`));
        }

        reloadNextFile([res.data], this.next());
      },
      function(err)
      {
        if (err)
        {
          return done(app.createError(`Failed to handle changed file [${fileId}]: ${err.message}`));
        }

        done();
      }
    );
  }

  function scheduleFileDownload(fileId)
  {
    downloadQueue = downloadQueue.filter(f => f !== fileId);

    downloadQueue.push(fileId);

    if (downloadQueue.length === 1)
    {
      downloadNextFile();
    }
  }

  function downloadNextFile()
  {
    if (downloading)
    {
      return;
    }

    downloading = true;

    const fileId = downloadQueue.shift();
    const root = path.join(module.config.dataPath, fileId);
    const paths = {};

    step(
      function()
      {
        HelpFile.findById(fileId).lean().exec(this.next());
      },
      function(err, helpFile)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to find help file: ${err.message}`));
        }

        if (!helpFile)
        {
          return this.skip(app.createError(`Help file not found.`));
        }

        this.helpFile = helpFile;

        paths.zip = path.join(root, `${helpFile.version}.zip`);
        paths.html = path.join(root, `${helpFile.version}.html`);

        fs.pathExists(paths.html, this.next());
      },
      function(foo, exists)
      {
        if (exists)
        {
          return this.skip(app.createError(
            `Version already downloaded: ${this.helpFile.version}`,
            'ALREADY_EXISTS'
          ));
        }

        fs.unlink(paths.zip, this.next());
      },
      function()
      {
        fs.ensureDir(root, this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed tu ensure root dir: ${err.message}`));
        }

        gdrive.authorize(this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to authorize: ${err.message}`));
        }

        const req = {
          fileId,
          mimeType: 'application/zip'
        };

        gdrive.drive.files.export(req, {responseType: 'stream'}, this.next());
      },
      function(err, res)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to init export: ${err.message}`));
        }

        const downloaded = _.once(this.next());

        res.data
          .on('error', err => downloaded(app.createError(`Failed to export file: ${err.message}`)))
          .on('end', () => downloaded())
          .pipe(fs.createWriteStream(paths.zip));
      },
      async function(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        const buf = fs.readFile(paths.zip);
        const zip = await new JSZip().loadAsync(buf);

        this.html = await zip.file(/\.html$/i)[0].async('string');

        const images = zip.file(/^images\//i);

        for (let i = 0; i < images.length; ++i)
        {
          this.html = this.html.replace(
            new RegExp(`src="${_.escapeRegExp(images[i].name)}"`, 'g'),
            `src="data:image/png;base64,${await images[i].async('base64')}"`
          );
        }
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to read ZIP file: ${err.message}`));
        }

        fs.writeFile(paths.html, this.html, this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to write HTML file: ${err.message}`));
        }
      },
      function(err)
      {
        if (err)
        {
          if (err.code !== 'ALREADY_EXITS')
          {
            module.error(`Failed to download file [${fileId}]: ${err.message}`);
          }
        }
        else
        {
          module.debug(`Downloaded file: ${fileId}`);

          app.broker.publish('help.files.downloaded', {model: this.helpFile});

          setTimeout(removeOldVersions, 60000, root);
        }

        fs.unlink(paths.zip, () => {});

        downloading = false;

        if (downloadQueue.length)
        {
          downloadNextFile();
        }
      }
    );
  }

  function removeOldVersions(root)
  {
    step(
      function()
      {
        fs.readdir(root, this.next());
      },
      function(err, files)
      {
        if (err)
        {
          return this.skip(err);
        }

        files
          .filter(f => /^[0-9]+\.html$/.test(f))
          .sort((a, b) => b.localeCompare(a, undefined, {ignorePunctuation: true, numeric: true}))
          .forEach((f, i) =>
          {
            if (i === 0)
            {
              return;
            }

            fs.unlink(path.join(root, f), this.group());
          });
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to remove old versions: ${err.message}`);
        }
      }
    );
  }
};