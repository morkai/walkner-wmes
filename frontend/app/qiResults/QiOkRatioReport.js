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

    urlRoot: '/qi/reports/okRatio',

    nlsDomain: 'qiResults',

    defaults: function()
    {
      return {
        interval: 'month',
        from: 0,
        to: 0
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
        _.pick(this.attributes, [
          'from', 'to'
        ])
      );

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/qi/reports/okRatio'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to');
    },

    parse: function(report)
    {
      return {
        divisions: report.options.divisions,
        total: report.total,
        groups: report.groups
      };
    }

  }, {

    fromQuery: function(query)
    {
      var from = time.getMoment(+query.from).startOf('month');
      var to = time.getMoment(+query.to).startOf('month');

      if (!from.isValid() || !to.isValid())
      {
        if (from.isValid())
        {
          to = from.clone().add(1, 'years');
        }
        else if (to.isValid())
        {
          from = to.clone().subtract(1, 'years');
        }
        else
        {
          from = time.getMoment().startOf('year');
          to = from.clone().add(1, 'years');
        }
      }

      if (from.valueOf() === to.valueOf() || to.valueOf() < from.valueOf())
      {
        to = from.clone().add(1, 'years');
      }

      return new this({
        from: from.valueOf(),
        to: to.valueOf()
      });
    }

  });
});
