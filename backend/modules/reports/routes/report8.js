// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const helpers = require('./helpers');
const report8 = require('../report8');

const ARRAY_PROPS = ['days', 'shifts', 'divisions', 'subdivisionTypes', 'prodLines'];
const NUMERIC_PROPS = [
  'fap0',
  'startup',
  'shutdown',
  'meetings',
  'sixS',
  'tpm',
  'trainings',
  'breaks',
  'coTime',
  'downtime',
  'unplanned'
];

module.exports = function report8Route(app, reportsModule, req, res, next)
{
  const express = app[reportsModule.config.expressId];
  const orgUnitsModule = app[reportsModule.config.orgUnitsId];
  const settingsModule = app[reportsModule.config.settingsId];
  const query = req.query;
  const options = {
    debug: query.debug === '1',
    fromTime: helpers.getTime(query.from),
    toTime: helpers.getTime(query.to),
    interval: query.interval,
    unit: query.unit,
    days: prepareArrayOption(query.days),
    shifts: prepareArrayOption(query.shifts).map(Number),
    divisions: prepareArrayOption(query.divisions),
    subdivisionTypes: prepareArrayOption(query.subdivisionTypes),
    prodLines: prepareArrayOption(query.prodLines),
    deactivatedProdLines: {},
    subdivisions: {},
    divisionSubdivisions: {},
    prodFlows: {},
    settings: {}
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(express.createHttpError('INVALID_TIME'));
  }

  options.fromTime = moment(options.fromTime).startOf(options.interval).valueOf();

  const toMoment = moment(options.toTime).startOf(options.interval);

  if (options.fromTime === toMoment.valueOf())
  {
    toMoment.add(1, options.interval);
  }

  options.toTime = toMoment.valueOf();

  _.forEach(ARRAY_PROPS, function(prop)
  {
    const value = query[prop];

    options[prop] = _.isString(value) && !_.isEmpty(value) ? value.split(',') : [];
  });

  _.forEach(NUMERIC_PROPS, function(prop)
  {
    const value = parseInt(query[prop], 10);

    options[prop] = !isNaN(value) && value >= 0 ? value : 0;
  });

  if (options.prodLines.length)
  {
    const divisions = {};

    _.forEach(options.prodLines, function(prodLineId)
    {
      const prodLine = orgUnitsModule.getByTypeAndId('prodLine', prodLineId);

      if (!prodLine)
      {
        return;
      }

      const prodFlows = orgUnitsModule.getProdFlowsFor(prodLine);

      _.forEach(prodFlows, function(prodFlow)
      {
        const prodFlowId = prodFlow._id.toString();

        if (!options.prodFlows[prodFlowId])
        {
          options.prodFlows[prodFlowId] = [];
        }

        options.prodFlows[prodFlowId].push(prodLineId);

        const subdivision = orgUnitsModule.getSubdivisionFor(prodFlow);

        if (subdivision)
        {
          if (!options.subdivisions[subdivision._id])
          {
            options.subdivisions[subdivision._id] = [];
          }

          options.subdivisions[subdivision._id].push(prodLineId);

          divisions[subdivision.division] = 1;

          if (!options.divisionSubdivisions[subdivision.division])
          {
            options.divisionSubdivisions[subdivision.division] = {};
          }

          options.divisionSubdivisions[subdivision.division][subdivision._id] = true;
        }
      });
    });

    options.divisions = Object.keys(divisions);
  }
  else
  {
    const prodDivisionCount = orgUnitsModule
      .getAllByType('division')
      .filter(function(d) { return d.type === 'prod'; })
      .length;
    const setProdFlows = options.divisions.length !== prodDivisionCount;

    _.forEach(options.divisions, function(divisionId)
    {
      options.divisionSubdivisions[divisionId] = {};

      _.forEach(orgUnitsModule.getSubdivisionsFor('division', divisionId), function(subdivision)
      {
        if (!_.includes(options.subdivisionTypes, subdivision.type))
        {
          return;
        }

        options.divisionSubdivisions[divisionId][subdivision._id] = 1;
        options.subdivisions[subdivision._id] = helpers.idToStr(orgUnitsModule.getProdLinesFor(subdivision));

        if (!setProdFlows)
        {
          return;
        }

        _.forEach(orgUnitsModule.getProdFlowsFor(subdivision), function(prodFlow)
        {
          options.prodFlows[prodFlow._id] = helpers.idToStr(orgUnitsModule.getProdLinesFor(prodFlow));
        });
      });

      options.divisionSubdivisions[divisionId] = Object.keys(options.divisionSubdivisions[divisionId]);
    });
  }

  _.forEach(orgUnitsModule.getAllByType('prodLine'), function(prodLine)
  {
    if (prodLine.deactivatedAt)
    {
      options.deactivatedProdLines[prodLine._id] = prodLine.deactivatedAt.getTime();
    }
  });

  step(
    function getSettingsStep()
    {
      settingsModule.findValues({_id: /^reports\.lean/}, 'reports.lean.', this.next());
    },
    function generateReportStep(err, settings)
    {
      if (err)
      {
        return this.skip(err);
      }

      options.settings = settings;

      helpers.generateReport(
        app,
        reportsModule,
        report8,
        '8',
        req.reportHash,
        options,
        this.next()
      );
    },
    function sendResultStep(err, reportJson)
    {
      if (err)
      {
        return next(err);
      }

      res.type('json');
      res.send(reportJson);
    }
  );
};

function prepareArrayOption(input)
{
  return _.isString(input) && !_.isEmpty(input) ? input.split(',') : [];
}
