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

    urlRoot: '/qi/reports/nokRatio',

    nlsDomain: 'qiResults',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        kinds: []
      };
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      var data = options.data = _.assign(
        options.data || {},
        _.pick(this.attributes, [
          'from', 'to', 'kinds'
        ])
      );
      data.kinds = data.kinds.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/qi/reports/nokRatio'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&kinds=' + this.get('kinds');
    },

    parse: function(report)
    {
      return {
        divisions: report.options.divisions,
        total: report.total,
        division: report.division
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
        to: to.valueOf(),
        kinds: _.isEmpty(query.kinds) ? [] : query.kinds.split(',')
      });
    }

  });
});
