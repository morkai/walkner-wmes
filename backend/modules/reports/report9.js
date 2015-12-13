// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var util = require('./util');

module.exports = function(mongoose, options, done)
{
  /*jshint validthis:true*/

  var MONTHS_FUTURE = 4;
  var MONTHS_PAST = 6;

  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var Cag = mongoose.model('Cag');
  var CagGroup = mongoose.model('CagGroup');
  var CagPlan = mongoose.model('CagPlan');

  var results = {
    options: options,
    months: _.map(new Array(MONTHS_FUTURE), function(unused, i)
    {
// todo
return moment().startOf('month').subtract(2, 'months').add(i, 'months').valueOf();
      return moment().startOf('month').add(i, 'months').valueOf();
    }),
    cags: {},
    groups: {},
    orderCount: 0,
    prodLines: {}
  };

  step(
    function findCagModelsStep()
    {
      var currentMonth = moment().startOf('month');
// TODO
currentMonth.subtract(2, 'months');
      var conditions = {
        '_id.month': {
          $gte: currentMonth.clone().toDate(),
          $lt: currentMonth.add(MONTHS_FUTURE, 'months').toDate()
        }
      };

      CagPlan.find(conditions, {__v: 0}).lean().exec(this.parallel());
      CagGroup.find({}, {__v: 0}).sort({name: 1}).lean().exec(this.parallel());
      Cag.find({}, {__v: 0}).sort({_id: 1}).lean().exec(this.parallel());
    },
    function prepareCagModelsStep(err, cagPlans, cagGroups, cags)
    {
      if (err)
      {
        return this.skip(err);
      }

      var emptyPlan = _.map(results.months, function() { return 0; });

      _.forEach(cags, function(cag)
      {
        cag.group = null;
        cag.plan = [].concat(emptyPlan);

        results.cags[cag._id] = cag;
      });

      _.forEach(cagGroups, function(cagGroup)
      {
        results.groups[cagGroup._id] = cagGroup;

        _.forEach(cagGroup.cags, function(cagId)
        {
          var cag = results.cags[cagId];

          if (cag)
          {
            cag.group = cagGroup._id;
          }
        });
      });

      _.forEach(cagPlans, function(cagPlan)
      {
        var cag = results.cags[cagPlan._id.cag];

        if (cag)
        {
          cag.plan[results.months.indexOf(cagPlan._id.month.getTime())] = cagPlan.value;
        }
      });

      setImmediate(this.next());
    },
    function readNc12ToCagsJsonStep()
    {
      fs.readFile(results.options.nc12ToCagsJsonPath, 'utf8', this.next());
    },
    function parseNc12ToCagsJsonStep(err, nc12ToCagsJson)
    {
      if (err)
      {
        return this.skip(err);
      }

      try
      {
        this.nc12ToCags = JSON.parse(nc12ToCagsJson);
      }
      catch (err)
      {
        return this.skip(err);
      }

      setImmediate(this.next());
    },
    function handleProdShiftOrdersStep()
    {
      var conditions = {
        startedAt: {
          $gt: moment().startOf('month').subtract(MONTHS_PAST, 'months').toDate()
        },
        mechOrder: false
      };
      var fields = {
        _id: 0,
        prodLine: 1,
        'orderData.nc12': 1,
        machineTime: 1
      };
      var stream = ProdShiftOrder.find(conditions, fields).lean().stream();
      var next = _.once(this.next());

      stream.on('data', handleProdShiftOrder.bind(null, this.nc12ToCags));
      stream.on('error', next);
      stream.on('close', next);
    },
    function calculateAvgQPerShiftStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      _.forEach(results.prodLines, function(cags)
      {
        _.forEach(cags, function(data, cagId)
        {
          cags[cagId] = util.round(data[0] / data[1]);
        });
      });

      setImmediate(this.next());
    },
    function finalizeStep(err)
    {
      if (err)
      {
        return done(err);
      }

      return done(null, results);
    }
  );

  function handleProdShiftOrder(nc12ToCags, prodShiftOrder)
  {
    var cagId = nc12ToCags[prodShiftOrder.orderData.nc12];

    if (!cagId || !results.cags[cagId])
    {
      return;
    }

    results.orderCount++;

    var prodLine = prodShiftOrder.prodLine;
    var machineTime = prodShiftOrder.machineTime;
    var qPerShift = machineTime === 0 ? 0 : ((7.5 * 3600) / (machineTime * 3600 / 100));

    if (!results.prodLines[prodLine])
    {
      results.prodLines[prodLine] = {};
    }

    var prodLineCags = results.prodLines[prodLine];

    if (!prodLineCags[cagId])
    {
      prodLineCags[cagId] = [0, 0];
    }

    prodLineCags[cagId][0] += qPerShift;
    prodLineCags[cagId][1] += 1;
  }
};
