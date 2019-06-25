// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model'
], function(
  _,
  t,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/qi/reports/outgoingQuality',

    nlsDomain: 'qiResults',

    defaults: function()
    {
      return {
        week: '',
        interval: 'week'
      };
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.assign(
        options.data || {},
        _.pick(this.attributes, ['week'])
      );

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return this.urlRoot
        + '?week=' + encodeURIComponent(this.get('week'));
    },

    parse: function(report)
    {
      return _.omit(report, ['options']);
    }

  }, {

    fromQuery: function(query)
    {
      return new this({week: this.parseWeek(query.week)});
    },

    parseWeek: function(input)
    {
      input = (input || '').trim();

      var moment = time.getMoment();
      var match = input.match(/([0-9]{2,4})?.*?W([0-9]{1,2})/);
      var year = 0;
      var week = 0;

      if (match)
      {
        year = +match[1];
        week = +match[2];
      }
      else if (/[0-9]{1,2}/.test(input))
      {
        week = +input.match(/([0-9]{1,2})/)[1];
      }

      if (!year)
      {
        year = moment.isoWeekYear();
      }
      else if (year < 100)
      {
        year += 2000;
      }

      if (!week || week < 1 || week > 53)
      {
        week = moment.isoWeek();
      }

      if (week < 10)
      {
        week = '0' + week;
      }

      return year + '-W' + week;
    }

  });
});
