// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const moment = require('moment');
const step = require('h5.step');
const fs = require('fs-extra');
const deepEqual = require('deep-equal');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^KANBAN\.json$/,
  parsedOutputDir: null
};

const BATCH_SIZE = 100;
const UPDATER = {
  id: null,
  label: 'System'
};

exports.start = function startKanbanImporterModule(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const KanbanComponent = mongoose.model('KanbanComponent');
  const KanbanEntry = mongoose.model('KanbanEntry');

  const filePathCache = {};
  const queue = [];
  let locked = false;

  app.broker.subscribe('directoryWatcher.changed', queueFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    if (filePathCache[fileInfo.filePath] || !module.config.filterRe.test(fileInfo.fileName))
    {
      return false;
    }

    fileInfo.timeKey = createTimeKey(fileInfo.timestamp);

    return true;
  }

  function createTimeKey(timestamp)
  {
    return moment(timestamp).subtract(1, 'days').format('YYMMDDHHMM');
  }

  function queueFile(fileInfo)
  {
    filePathCache[fileInfo.filePath] = true;

    queue.push(fileInfo);

    module.debug('[%s] Queued...', fileInfo.timeKey);

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

    module.debug('[%s] Importing...', fileInfo.timeKey);

    importFile(fileInfo, (err, updatedAt, entryCount, componentCount) =>
    {
      cleanUpFileInfoFile(fileInfo);

      if (err)
      {
        module.error('[%s] Failed to import: %s', fileInfo.timeKey, err.message);

        app.broker.publish('kanban.import.failure', {
          timestamp: fileInfo.timestamp,
          error: err.message
        });
      }
      else
      {
        module.debug('[%s] Imported in %d ms', fileInfo.timeKey, Date.now() - startTime);

        app.broker.publish('kanban.import.success', {
          timestamp: fileInfo.timestamp,
          updatedAt,
          entryCount,
          componentCount
        });
      }

      locked = false;

      setImmediate(importNext);
    });
  }

  function importFile(fileInfo, done)
  {
    step(
      function readFileStep()
      {
        fs.readFile(fileInfo.filePath, {encoding: 'utf8'}, this.next());
      },
      function parseFileStep(err, fileContents)
      {
        if (err)
        {
          return this.skip(err);
        }

        module.debug('[%s] Parsing ~%d bytes...', fileInfo.timeKey, fileContents.length);

        this.t = new Date();

        try
        {
          this.input = JSON.parse(fileContents);
          this.kanbanCount = this.input.kanbans.rows.length;
          this.componentCount = this.input.components.rows.length;

          module.debug(
            '[%s] Parsed %d kanbans & %d components in %d ms!',
            fileInfo.timeKey,
            this.kanbanCount,
            this.componentCount,
            Date.now() - this.t
          );
        }
        catch (err)
        {
          return this.skip(err);
        }

        setImmediate(this.next());
      },
      function importComponentsStep()
      {
        importDocs(KanbanComponent, this.input.components, this.t, this.next());
      },
      function importEntriesStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        importDocs(KanbanEntry, this.input.kanbans, this.t, this.next());
      },
      function finalizeStep(err)
      {
        return done(err, this.t, this.kanbanCount, this.componentCount);
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
          'Failed to rename file [%s] to [%s]: %s', oldFilePath, newFilePath, err.message
        );
      }
    });
  }

  function deleteFileInfoFile(filePath)
  {
    fs.unlink(filePath, function(err)
    {
      if (err)
      {
        module.error('Failed to delete file [%s]: %s', filePath, err.message);
      }
    });
  }

  function removeFilePathFromCache(filePath)
  {
    delete filePathCache[filePath];
  }

  function importDocs(Model, input, updatedAt, done)
  {
    if (!input.rows.length)
    {
      return done();
    }

    step(
      function()
      {
        this.newDocs = new Map();

        input.rows.splice(0, BATCH_SIZE).forEach(d =>
        {
          this.newDocs.set(d[0], d);
        });

        Model
          .find({_id: {$in: Array.from(this.newDocs.keys())}}, {changes: 0})
          .lean()
          .exec(this.next());
      },
      function(err, oldDocs)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.inserts = [];
        this.updates = [];

        oldDocs.forEach(oldDoc =>
        {
          compareDocs(
            oldDoc,
            this.newDocs.get(oldDoc._id),
            input.columns,
            updatedAt,
            this.updates
          );

          this.newDocs.delete(oldDoc._id);
        });

        this.newDocs.forEach(newDoc =>
        {
          this.inserts.push(Model.createFromImport(newDoc, updatedAt, UPDATER));
        });

        setImmediate(this.next());
      },
      function()
      {
        if (this.inserts.length)
        {
          Model.collection.insertMany(this.inserts, this.next());
        }
      },
      function(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.updates.forEach(update =>
        {
          Model.collection.updateOne({_id: update._id}, update.update, this.group());
        });
      },
      function(err)
      {
        if (err)
        {
          return done(err);
        }

        importDocs(Model, input, updatedAt, done);
      }
    );
  }

  function compareDocs(oldDoc, newDoc, columns, updatedAt, updates)
  {
    const update = {
      $set: {updatedAt},
      $push: {
        changes: {
          date: updatedAt,
          user: UPDATER,
          data: {}
        }
      }
    };

    columns.forEach((column, i) =>
    {
      const oldValue = oldDoc[column];
      const newValue = newDoc[i];

      if (deepEqual(newValue, oldValue))
      {
        return;
      }

      update.$set[column] = newValue;
      update.$set[`updates.${column}`] = {
        date: updatedAt,
        user: UPDATER,
        data: oldValue
      };
      update.$push.changes.data[column] = [oldValue, newValue];
    });

    if (Object.keys(update.$set).length === 1)
    {
      return;
    }

    updates.push({
      _id: oldDoc._id,
      update
    });
  }
};
