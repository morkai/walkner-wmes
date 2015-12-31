// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var os = require('os');
var fs = require('fs');
var _ = require('lodash');
var multer = require('multer');
var csv = require('csv');

module.exports = function setUpMechOrdersRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var auth = app[ordersModule.config.userId].auth;
  var MechOrder = app[ordersModule.config.mongooseId].model('MechOrder');
  var importing = null;

  express.get('/mechOrders', express.crud.browseRoute.bind(null, app, MechOrder));

  express.get('/mechOrders/:id', express.crud.readRoute.bind(null, app, MechOrder));

  express.post(
    '/mechOrders;import',
    auth('ORDERS:MANAGE'),
    multer({
      dest: os.tmpdir(),
      limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024
      }
    }).single('mechOrders'),
    importRoute
  );

  express.patch('/mechOrders/:id', express.crud.editRoute.bind(null, app, MechOrder));

  function removeFile(req)
  {
    if (req.file)
    {
      fs.unlink(req.file.path, _.noop);
    }
  }

  function importRoute(req, res, next)
  {
    if (importing !== null)
    {
      removeFile(req);

      return res.sendStatus(400);
    }

    var mechOrdersFile = req.file;

    if (!mechOrdersFile || !/\.csv$/i.test(mechOrdersFile.originalname))
    {
      removeFile(req);

      return res.sendStatus(400);
    }

    importing = 0;

    ordersModule.debug("Importing mech orders...");

    var importTs = new Date();
    var mechOrders = {};
    var nc12Queue = [];

    csv()
      .from.stream(fs.createReadStream(mechOrdersFile.path), {delimiter: ';'})
      .on('record', function(row)
      {
        if (row.length < 12 || !/^[0-9]{12}$/.test(row[0]))
        {
          return;
        }

        var nc12 = row[0];

        if (typeof mechOrders[nc12] === 'undefined')
        {
          nc12Queue.push(nc12);

          var mrp = row[11].trim();

          if (mrp.length === 0 || mrp.toUpperCase() === 'BRAK')
          {
            mrp = null;
          }

          mechOrders[nc12] = {
            _id: row[0],
            name: row[1],
            mrp: mrp,
            materialNorm: parseTime(row[10]),
            operations: [],
            importTs: importTs
          };
        }

        mechOrders[nc12].operations.push({
          no: row[2],
          workCenter: row[3],
          name: row[4],
          machineSetupTime: parseTime(row[6]),
          laborSetupTime: parseTime(row[7]),
          machineTime: parseTime(row[8]),
          laborTime: parseTime(row[9])
        });
      })
      .on('end', function()
      {
        removeFile(req);
        upsertNextMechOrder();
      })
      .on('error', function(err)
      {
        importing = null;

        ordersModule.debug("Failed parsing the CSV file: %s", err.message);

        next(err);
      });

    function upsertNextMechOrder()
    {
      if (nc12Queue.length === 0)
      {
        app.broker.publish('mechOrders.synced', {count: importing});

        ordersModule.info("Imported %d mech orders", importing);

        importing = null;

        return res.sendStatus(204);
      }

      var mechOrder = mechOrders[nc12Queue.shift()];
      var _id = mechOrder._id;

      delete mechOrder._id;

      MechOrder.collection.update({_id: _id}, {$set: mechOrder}, {upsert: true}, function(err)
      {
        if (err)
        {
          ordersModule.warn("Failed to upsert mech order %s: %s", _id, err.message);
        }
        else
        {
          ++importing;
        }

        upsertNextMechOrder();
      });
    }
  }

  function parseTime(time)
  {
    time = parseFloat(time.replace(',', '.'));

    return isNaN(time) || time < 0 ? -1 : time;
  }
};
