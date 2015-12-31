// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var fs = require('fs');
var _ = require('lodash');
var step = require('h5.step');
var csv = require('csv');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  filterRe: /^CAGS_PLAN_(.*?)\.csv$/
};

var MONTHS = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11
};
var MONTH_RE = new RegExp('^(' + Object.keys(MONTHS).join('|') + ')-([0-9]{2})$');

exports.start = function startCagPlanImporterModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var Cag = mongoose.model('Cag');
  var CagPlan = mongoose.model('CagPlan');

  var filePathCache = {};
  var locked = false;
  var queue = [];

  app.broker.subscribe('directoryWatcher.changed', queueFile).setFilter(filterFile);

  function filterFile(fileInfo)
  {
    return !filePathCache[fileInfo.filePath] && module.config.filterRe.test(fileInfo.fileName);
  }

  function queueFile(fileInfo)
  {
    filePathCache[fileInfo.filePath] = true;

    queue.push(fileInfo);

    module.debug("Queued...");

    setImmediate(importNext);
  }

  function importNext()
  {
    if (locked)
    {
      return;
    }

    var fileInfo = queue.shift();

    if (!fileInfo)
    {
      return;
    }

    locked = true;

    var startTime = Date.now();

    module.debug("Importing...");

    importFile(fileInfo, function(err, count)
    {
      cleanUpFile(fileInfo);

      if (err)
      {
        module.error("Failed to import: %s", err.message);

        app.broker.publish('cags.plan.syncFailed', {
          error: err.message
        });
      }
      else
      {
        module.debug("Imported %d in %d ms", count, Date.now() - startTime);

        app.broker.publish('cags.plan.synced', {
          count: count
        });
      }

      locked = false;

      setImmediate(importNext);
    });
  }

  function importFile(fileInfo, done)
  {
    step(
      function parseFileStep()
      {
        module.debug("Parsing [%s]...", fileInfo.filePath);

        this.t = Date.now();
        this.cags = {};

        parseInputCsv(fileInfo.filePath, this.cags, this.next());
      },
      function updateDbStep(err, cagPlans)
      {
        if (err)
        {
          return this.skip(err);
        }

        module.debug("Parsed %d items in %d ms!", cagPlans.length, Date.now() - this.t);

        this.count = cagPlans.length;

        insertCags(this.cags);
        updateCagPlansBatch(cagPlans, this.next());
      },
      function finalizeStep(err)
      {
        this.cags = null;

        return done(err, this.count);
      }
    );
  }

  function updateCagPlansBatch(cagPlans, done)
  {
    step(
      function()
      {
        for (var i = 0, l = Math.min(10, cagPlans.length); i < l; ++i)
        {
          var cagPlan = cagPlans.shift();

          CagPlan.update(
            {_id: cagPlan._id},
            {$set: {value: cagPlan.value}},
            {upsert: true},
            this.group()
          );
        }
      },
      function(err)
      {
        if (err)
        {
          module.error("Failed to upsert CagPlans: %s", err.message);
        }

        if (cagPlans.length === 0)
        {
          setImmediate(done);
        }
        else
        {
          setImmediate(updateCagPlansBatch, cagPlans, done);
        }
      }
    );
  }

  function insertCags(cags)
  {
    var docs = _.map(cags, function(name, id) { return {_id: id, name: name}; });

    if (docs.length === 0)
    {
      return;
    }

    Cag.collection.insert(docs, {ordered: false}, function(err)
    {
      if (err && err.code !== 11000)
      {
        module.error("Failed to create CAGs: %s", err.message);
      }
    });
  }

  function cleanUpFile(fileInfo)
  {
    setTimeout(removeFilePathFromCache, 15000, fileInfo.filePath);
    deleteFile(fileInfo.filePath);
  }

  function deleteFile(filePath)
  {
    fs.unlink(filePath, function(err)
    {
      if (err)
      {
        module.error("Failed to delete file [%s]: %s", filePath, err.message);
      }
    });
  }

  function removeFilePathFromCache(filePath)
  {
    delete filePathCache[filePath];
  }

  function parseInputCsv(inputFilePath, cags, done)
  {
    var complete = _.once(done);
    var cagPlans = [];
    var columns = {
      cagId: -1,
      name: -1,
      offset: -1,
      months: []
    };
    var processedCount = 0;
    var invalidCount = 0;
    var parser = csv().from.path(inputFilePath, {delimiter: ';'});

    parser.once('error', complete);

    parser.once('end', function()
    {
      complete(null, cagPlans);
    });

    parser.on('record', function(row)
    {
      if (invalidCount > 10)
      {
        return;
      }

      ++processedCount;

      if (columns.cagId === -1)
      {
        if (processedCount <= 10)
        {
          findColumns(row, columns);
        }

        return;
      }

      var cagId = row[columns.cagId];

      if (cagId.length !== 6)
      {
        return ++invalidCount;
      }

      var cagName = row[columns.cagName];

      if (!_.isEmpty(cagName))
      {
        cags[cagId] = cagName;
      }

      var offset = row[columns.offset];

      if (offset !== '11')
      {
        return;
      }

      _.forEach(columns.months, function(month)
      {
        var value = parseInt((row[month.index] || '0').replace(/[^0-9]/g, ''), 10);

        if (value > 0)
        {
          cagPlans.push({
            _id: {
              cag: cagId,
              month: month.date
            },
            value: value
          });
        }
      });

      invalidCount = 0;
    });
  }

  function findColumns(row, columns)
  {
    var cagId = -1;
    var cagName = -1;
    var offset = -1;
    var months = [];

    for (var i = 0; i < row.length; ++i)
    {
      var cell = row[i].toLowerCase();

      if (cell === 'cag id')
      {
        cagId = i;

        continue;
      }

      if (cell === 'cag name')
      {
        cagName = i;

        continue;
      }

      if (cell === 'offset')
      {
        offset = i;

        continue;
      }

      var matches = cell.match(MONTH_RE);

      if (matches === null)
      {
        continue;
      }

      var year = 2000 + parseInt(matches[2], 10);
      var month = MONTHS[matches[1]];

      months.push({
        index: i,
        date: new Date(year, month, 1, 0, 0, 0, 0)
      });
    }

    if (cagId !== -1 && cagName !== -1 && offset !== -1 && months.length !== 0)
    {
      columns.cagId = cagId;
      columns.cagName = cagName;
      columns.offset = offset;
      columns.months = months;
    }
  }
};
