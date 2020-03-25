// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/data/localStorage'
], function(
  _,
  t,
  time,
  Model,
  localStorage
) {
  'use strict';

  return Model.extend({

    urlRoot: '/ct/reports/results',

    nlsDomain: 'wmes-ct-pces',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        ignoredMrps: null,
        includedMrps: null,
        minLineWorkDuration: null,
        minUpphWorkDuration: null,
        shiftCount: null,
        availableWorkDuration: null,
        minMrpUnbalance: null,
        minMrpEfficiency: null,
        tab: 'mrps',
        upph: localStorage.getItem('WMES_CT_RESULTS_UPPH_MODE') || 'standard',
        report: null
      };
    },

    initialize: function()
    {
      this.on('change:upph', function()
      {
        localStorage.setItem('WMES_CT_RESULTS_UPPH_MODE', this.get('upph'));
      });
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
          'from', 'to',
          'ignoredMrps',
          'includedMrps',
          'minLineWorkDuration',
          'minUpphWorkDuration',
          'shiftCount',
          'availableWorkDuration',
          'minMrpUnbalance',
          'minMrpEfficiency'
        ])
      );

      Object.keys(options.data).forEach(function(key)
      {
        if (Array.isArray(options.data[key]))
        {
          options.data[key] = options.data[key].join(',');
        }
      });

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      var attrs = this.attributes;
      var url = this.urlRoot
        + '?from=' + (attrs.from || '')
        + '&to=' + (attrs.to || '')
        + '&tab=' + attrs.tab;

      var props = {
        ignoredMrps: 'xm',
        includedMrps: 'im',
        minLineWorkDuration: 'mlwd',
        minUpphWorkDuration: 'muwd',
        shiftCount: 'sc',
        availableWorkDuration: 'awd',
        minMrpUnbalance: 'mmu',
        minMrpEfficiency: 'mme'
      };

      _.forEach(props, function(short, full)
      {
        var value = attrs[full];

        if (value != null)
        {
          url += '&' + short + '=' + (Array.isArray(value) ? value.join(',') : value);
        }
      });

      return url;
    },

    parse: function(report)
    {
      return {
        report: report
      };
    }

  }, {

    fromQuery: function(query)
    {
      var attrs = {
        from: +query.from || 0,
        to: +query.to || 0,
        tab: query.tab || undefined,
        upph: query.upph || undefined
      };

      if (!attrs.from && !attrs.to)
      {
        var moment = time.getMoment();

        if (moment.isoWeekday() >= 4)
        {
          moment.startOf('isoWeek').add(7, 'days');
        }
        else
        {
          moment.startOf('isoWeek');
        }

        attrs.to = moment.valueOf();
        attrs.from = moment.subtract(4, 'weeks').valueOf();
      }

      if (query.xm)
      {
        attrs.ignoredMrps = query.xm.split(',').filter(function(v) { return !!v.length; });
      }

      if (query.im)
      {
        attrs.includedMrps = query.im.split(',').filter(function(v) { return !!v.length; });
      }

      var props = {
        minLineWorkDuration: 'mlwd',
        minUpphWorkDuration: 'muwd',
        shiftCount: 'sc',
        availableWorkDuration: 'awd',
        minMrpUnbalance: 'mmu',
        minMrpEfficiency: 'mme'
      };

      _.forEach(props, function(short, full)
      {
        var value = parseFloat(query[short]);

        if (!isNaN(value) && value != null)
        {
          attrs[full] = value;
        }
      });

      return new this(attrs);
    }

  });
});
