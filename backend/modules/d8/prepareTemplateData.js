// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');

module.exports = function setUpPrepareTemplateData(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const D8EntrySource = mongoose.model('D8EntrySource');
  const D8ProblemSource = mongoose.model('D8ProblemSource');

  const EMAIL_URL_PREFIX = module.config.emailUrlPrefix;

  const nameMaps = {
    status: {
      open: 'Otwarte',
      closed: 'Zamknięte'
    },
    entrySource: {},
    problemSource: {}
  };

  module.prepareTemplateData = prepareTemplateData;

  function prepareTemplateData(mode, entry, done)
  {
    const templateData = {
      mode: mode,
      urlPrefix: EMAIL_URL_PREFIX,
      entry: {
        _id: entry._id,
        rid: entry.rid,
        owner: entry.owner.label,
        members: (entry.members || []).map(member => member.label),
        status: nameMaps.status[entry.status],
        division: entry.division,
        subject: entry.subject,
        strips: _.map(entry.strips, function(strip)
        {
          return {
            no: strip.no,
            date: formatDate(strip.date),
            family: strip.family
          };
        }),
        problemDescription: entry.problemDescription,
        problemSource: entry.problemSource,
        entrySource: entry.entrySource,
        crsRegisterDate: formatDate(entry.crsRegisterDate),
        d8CloseDate: formatDate(entry.d8CloseDate),
        d5CloseDate: formatDate(entry.d5CloseDate),
        d5PlannedCloseDate: formatDate(entry.d5PlannedCloseDate),
        attachment: entry.attachment,
        duration: entry.duration,
        comment: mode === 'edit' ? _.last(entry.changes).comment : ''
      }
    };

    step(
      function()
      {
        findName(D8EntrySource, entry, 'entrySource', 'name', this.parallel());
        findName(D8ProblemSource, entry, 'problemSource', 'name', this.parallel());
      },
      function(err, entrySource, problemSource)
      {
        if (err)
        {
          return done(err);
        }

        templateData.entry.entrySource = entrySource;
        templateData.entry.problemSource = problemSource;

        return done(null, templateData);
      }
    );
  }

  function formatDate(date)
  {
    return date ? moment(date).format('LL') : '';
  }

  function findName(Model, entry, mapProperty, nameProperty, done)
  {
    const id = entry[mapProperty];
    const nameMap = nameMaps[mapProperty];
    const multiple = _.isArray(id);

    if (multiple)
    {
      const names = [];

      _.forEach(id, function(id)
      {
        if (nameMap[id])
        {
          names.push(nameMap[id]);
        }
      });

      if (names.length === id.length)
      {
        return setImmediate(done, null, names);
      }
    }
    else if (nameMap[id])
    {
      return setImmediate(done, null, nameMap[id]);
    }

    const conditions = {
      _id: multiple ? {$in: id} : id
    };
    const fields = {[nameProperty]: 1};

    Model.find(conditions, fields).lean().exec(function(err, models)
    {
      if (err)
      {
        return done(err);
      }

      if (_.isEmpty(models))
      {
        return done(null, id);
      }

      if (!multiple)
      {
        return done(null, models[0][nameProperty]);
      }

      const names = [];

      _.forEach(models, function(model)
      {
        const name = model[nameProperty];

        nameMap[model._id] = name;

        names.push(name);
      });

      return done(null, names);
    });
  }
};
