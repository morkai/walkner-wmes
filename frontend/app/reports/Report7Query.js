// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../user',
  '../core/Model'
], function(
  _,
  time,
  user,
  Model
) {
  'use strict';

  return Model.extend({

    defaults: function()
    {
      return {
        specificAor: null,
        aors: null,
        statuses: null,
        limit: 8,
        skip: 0,
        customTimes: false,
        clipFrom: null,
        clipTo: null,
        clipInterval: null,
        dtlFrom: null,
        dtlTo: null,
        dtcFrom: null,
        dtcTo: null,
        dtcInterval: null
      };
    },

    initialize: function(data, options)
    {
      if (!options.settings)
      {
        throw new Error('settings option is required!');
      }

      this.settings = options.settings;

      if (this.settings.isEmpty())
      {
        this.listenToOnce(this.settings, 'reset', this.setDefaultsFromSettings);
      }
      else
      {
        this.setDefaultsFromSettings();
      }
    },

    setDefaultsFromSettings: function()
    {
      var settings = this.settings;
      var attrs = this.attributes;
      var changes = {};

      if (attrs.specificAor === null)
      {
        attrs.specificAor = settings.getValue('downtimesInAors.specificAor');
      }

      if (attrs.aors === null)
      {
        attrs.aors = settings.getDefaultDowntimeAors();
      }

      if (attrs.statuses === null)
      {
        attrs.statuses = settings.getDefaultDowntimeStatuses();
      }

      if (!attrs.customTimes)
      {
        attrs.clipFrom = null;
        attrs.clipTo = null;
        attrs.clipInterval = null;
        attrs.dtlFrom = null;
        attrs.dtlTo = null;
        attrs.dtcFrom = null;
        attrs.dtcTo = null;
        attrs.dtcInterval = null;
      }

      this.set(changes, {silent: true});
    },

    serializeToObject: function()
    {
      var obj = {
        specificAor: this.get('specificAor') || '',
        aors: (this.get('aors') || []).join(','),
        statuses: 'confirmed'
      };

      this.applyCustomClipTimes(obj);
      this.applyCustomDtcTimes(obj);

      return obj;
    },

    serializeToString: function()
    {
      var queryString = '';
      var attrs = this.attributes;

      if (attrs.customTimes)
      {
        queryString += '&customTimes=1'
          + '&clipFrom=' + attrs.clipFrom
          + '&clipTo=' + attrs.clipTo
          + '&clipInterval=' + attrs.clipInterval
          + '&dtlFrom=' + attrs.dtlFrom
          + '&dtlTo=' + attrs.dtlTo
          + '&dtcFrom=' + attrs.dtcFrom
          + '&dtcTo=' + attrs.dtcTo
          + '&dtcInterval=' + attrs.dtcInterval;
      }

      if (attrs.aors)
      {
        queryString += '&aors=' + attrs.aors;
      }

      queryString += '&specificAor=' + attrs.specificAor
        + '&statuses=' + attrs.statuses
        + '&limit=' + attrs.limit
        + '&skip=' + attrs.skip;

      return queryString.substr(1);
    },

    createProdDowntimesSelector: function()
    {
      var statuses = this.get('statuses') || [];
      var aors = _.unique((this.get('aors') || []).concat(this.get('specificAor')))
        .filter(function(aor) { return !!aor; });
      var dateRange = this.applyCustomDtlTimes({});
      var selector = {
        name: 'and',
        args: []
      };

      selector.args.push({
        name: 'ge',
        args: ['startedAt', time.getMoment(dateRange.dtlFrom, 'YYYY-MM-DD').hours(6).valueOf()]
      }, {
        name: 'lt',
        args: ['startedAt', time.getMoment(dateRange.dtlTo, 'YYYY-MM-DD').hours(6).valueOf()]
      });

      if (statuses.length === 2)
      {
        selector.args.push({name: 'in', args: ['status', statuses]});
      }
      else if (statuses.length === 1)
      {
        selector.args.push({name: 'eq', args: ['status', statuses[0]]});
      }

      if (aors.length === 1)
      {
        selector.args.push({name: 'eq', args: ['aor', aors[0]]});
      }
      else if (aors.length > 0)
      {
        selector.args.push({name: 'in', args: ['aor', aors]});
      }

      return selector;
    },

    getDowntimesChartInterval: function()
    {
      return this.applyCustomDtcTimes({}).dtcInterval;
    },

    getCustomTimes: function()
    {
      var data = {};

      this.applyCustomClipTimes(data);
      this.applyCustomDtlTimes(data);
      this.applyCustomDtcTimes(data);

      return data;
    },

    setCustomTimes: function(data)
    {
      data.customTimes = true;

      this.set(data, {reset: true});
    },

    resetCustomTimes: function(data)
    {
      this.set(_.assign(data, {customTimes: false}), {reset: true});
    },

    applyCustomClipTimes: function(data)
    {
      var clipFrom = this.get('clipFrom');
      var clipTo = this.get('clipTo');
      var clipInterval = this.get('clipInterval');

      if (!this.get('customTimes'))
      {
        var clipTimeRange = this.settings.getDateRange('downtimesInAors.clipDateRange');

        clipFrom = clipTimeRange.from;
        clipTo = clipTimeRange.to;
        clipInterval = this.settings.getValue('downtimesInAors.clipInterval') || clipTimeRange.interval;
      }

      data.clipFrom = clipFrom;
      data.clipTo = clipTo;
      data.clipInterval = clipInterval;

      return data;
    },

    applyCustomDtlTimes: function(data)
    {
      var dtlFrom = this.get('dtlFrom');
      var dtlTo = this.get('clipTo');

      if (!this.get('customTimes'))
      {
        var dtlTimeRange = this.settings.getDateRange('downtimesInAors.dtlDateRange');

        dtlFrom = dtlTimeRange.from;
        dtlTo = dtlTimeRange.to;
      }

      data.dtlFrom = dtlFrom;
      data.dtlTo = dtlTo;

      return data;
    },

    applyCustomDtcTimes: function(data)
    {
      var dtcFrom = this.get('dtcFrom');
      var dtcTo = this.get('dtcTo');
      var dtcInterval = this.get('dtcInterval');

      if (!this.get('customTimes'))
      {
        var dtcTimeRange = this.settings.getDateRange('downtimesInAors.dtcDateRange');

        dtcFrom = dtcTimeRange.from;
        dtcTo = dtcTimeRange.to;
        dtcInterval = this.settings.getValue('downtimesInAors.dtcInterval') || dtcTimeRange.interval;
      }

      data.dtcFrom = dtcFrom;
      data.dtcTo = dtcTo;
      data.dtcInterval = dtcInterval;

      return data;
    }

  }, {

    prepareAttrsFromQuery: function(query)
    {
      return {
        specificAor: query.specificAor === undefined ? null : query.specificAor,
        aors: query.aors === undefined ? null : query.aors.split(','),
        statuses: query.statuses === undefined ? null : query.statuses.split(','),
        limit: parseInt(query.limit, 10) || undefined,
        skip: parseInt(query.skip, 10) || undefined,
        customTimes: query.customTimes === '1',
        clipFrom: query.clipFrom,
        clipTo: query.clipTo,
        clipInterval: query.clipInterval,
        dtlFrom: query.dtlFrom,
        dtlTo: query.dtlTo,
        dtcFrom: query.dtcFrom,
        dtcTo: query.dtcTo,
        dtcInterval: query.dtcInterval
      };
    },

    fromQuery: function(query, options)
    {
      return new this(this.prepareAttrsFromQuery(query), options);
    }

  });
});
