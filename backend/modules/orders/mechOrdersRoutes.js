'use strict';

var fs = require('fs');
var multipart = require('express').multipart;
var csv = require('csv');
var crud = require('../express/crud');

module.exports = function setUpMechOrdersRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var auth = app[ordersModule.config.userId].auth;
  var MechOrder = app[ordersModule.config.mongooseId].model('MechOrder');
  var importing = null;

  express.get('/mechOrders', crud.browseRoute.bind(null, app, MechOrder));

  express.get('/mechOrders/:id', crud.readRoute.bind(null, app, MechOrder));

  express.post('/mechOrders;import', auth('ORDERS:MANAGE'), multipart({limit: '5mb'}), importRoute);

  function importRoute(req, res, next)
  {
    if (importing !== null)
    {
      return res.send(400);
    }

    var mechOrdersFile = req.files.mechOrders;

    if (!mechOrdersFile
      || Array.isArray(mechOrdersFile)
      || !/\.csv$/i.test(mechOrdersFile.originalFilename))
    {
      removeFiles(req.files);

      return res.send(400);
    }

    importing = 0;

    ordersModule.debug("Importing mech orders...");

    var importTs = new Date();
    var mechOrders = {};
    var nc12Queue = [];

    csv()
      .from.stream(fs.createReadStream(mechOrdersFile.path))
      .on('record', function(row)
      {
        if (row.length !== 10
          || !/^[0-9]{12}$/.test(row[0]))
        {
          return;
        }

        var nc12 = row[0];

        if (typeof mechOrders[nc12] === 'undefined')
        {
          nc12Queue.push(nc12);

          mechOrders[nc12] = {
            _id: row[0],
            name: row[1],
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
        removeFiles(req.files);
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

        return res.send(204);
      }

      var mechOrder = mechOrders[nc12Queue.shift()];
      var _id = mechOrder._id;

      delete mechOrder._id;

      MechOrder.collection.update({_id: _id}, {$set: mechOrder}, {upsert: true}, function(err)
      {
        if (err)
        {
          module.warn("Failed to upsert mech order %s: %s", _id, err.message);
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

  function removeFiles(files)
  {
    Object.keys(files).forEach(function(key)
    {
      if (Array.isArray(files[key]))
      {
        files[key].forEach(function(file)
        {
          fs.unlink(file.path);
        });
      }
      else
      {
        fs.unlink(files[key].path);
      }
    });
  }
};
