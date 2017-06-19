// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');

module.exports = function(mongoose, options, done)
{
  const MONTHS_FUTURE = 4;
  const MONTHS_PAST = 6;

  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const Cag = mongoose.model('Cag');
  const CagGroup = mongoose.model('CagGroup');
  const CagPlan = mongoose.model('CagPlan');

  const results = {
    options: options,
    months: _.map(new Array(MONTHS_FUTURE), function(unused, i)
    {
      return moment().startOf('month').add(i, 'months').valueOf();
    }),
    cags: {},
    groups: {},
    orderCount: 0,
    lines: {}
  };

  step(
    function findCagModelsStep()
    {
      const currentMonth = moment().startOf('month');

      const conditions = {
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

      const emptyPlan = _.map(results.months, function() { return 0; });

      _.forEach(cags, function(cag)
      {
        cag.group = null;
        cag.plan = [].concat(emptyPlan);
        cag.lines = {};
        cag.avgQPerShift = [0, 0];

        results.cags[cag._id] = cag;
      });

      _.forEach(cagGroups, function(cagGroup)
      {
        results.groups[cagGroup._id] = cagGroup;

        _.forEach(cagGroup.cags, function(cagId)
        {
          const cag = results.cags[cagId];

          if (cag)
          {
            cag.group = cagGroup._id;
          }
        });
      });

      _.forEach(cagPlans, function(cagPlan)
      {
        const cag = results.cags[cagPlan._id.cag];

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
      const conditions = {
        startedAt: {
          $gt: moment().startOf('month').subtract(MONTHS_PAST, 'months').toDate()
        },
        mechOrder: false
      };
      const fields = {
        _id: 0,
        prodLine: 1,
        'orderData.nc12': 1,
        machineTime: 1
      };
      const stream = ProdShiftOrder.find(conditions, fields).lean().cursor();
      const next = _.once(this.next());

      stream.on('error', next);
      stream.on('end', next);
      stream.on('data', handleProdShiftOrder.bind(null, this.nc12ToCags));
    },
    function summarizeLinesStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      _.forEach(results.lines, function(cags, prodLineId)
      {
        _.forEach(cags, function(data, cagId)
        {
          cags[cagId] = Math.round(data[0] / data[1]);
          results.cags[cagId].lines[prodLineId] = true;
        });
      });

      setImmediate(this.next());
    },
    function sortLinesStep()
    {
      const sortedLines = {};

      _.forEach(_.keys(results.lines).sort(function(a, b) { return a.localeCompare(b); }), function(line)
      {
        sortedLines[line] = results.lines[line];
      });

      results.lines = sortedLines;

      setImmediate(this.next());
    },
    function summarizeCagsStep()
    {
      _.forEach(results.cags, function(cag)
      {
        cag.lines = _.size(cag.lines);
        cag.avgQPerShift = Math.round(cag.avgQPerShift[0] / cag.avgQPerShift[1]) || 0;
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
    const cagId = nc12ToCags[prodShiftOrder.orderData.nc12];
    const cag = results.cags[cagId];

    if (!cag)
    {
      return;
    }

    results.orderCount++;

    const prodLine = prodShiftOrder.prodLine.split('~')[0];
    const machineTime = prodShiftOrder.machineTime;
    const qPerShift = machineTime === 0 ? 0 : ((7.5 * 3600) / (machineTime * 3600 / 100));

    if (!results.lines[prodLine])
    {
      results.lines[prodLine] = {};
    }

    const prodLineCags = results.lines[prodLine];

    if (!prodLineCags[cagId])
    {
      prodLineCags[cagId] = [0, 0];
    }

    prodLineCags[cagId][0] += qPerShift;
    prodLineCags[cagId][1] += 1;

    cag.avgQPerShift[0] += qPerShift;
    cag.avgQPerShift[1] += 1;
  }
};
