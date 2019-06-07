// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../user',
  '../core/Model',
  '../data/orgUnits',
  '../data/localStorage'
], function(
  _,
  time,
  user,
  Model,
  orgUnits,
  localStorage
) {
  'use strict';

  var ARRAY_PROPS = {
    days: true,
    shifts: true,
    divisions: true,
    subdivisionTypes: true,
    prodLines: true
  };
  var NUMERIC_PROPS = {
    fap0: 6,
    startup: 3,
    shutdown: 4,
    meetings: 5,
    sixS: 6,
    tpm: 7,
    trainings: 8,
    breaks: 30,
    coTime: 9,
    downtime: 3,
    unplanned: 0
  };
  var SERIES = [
    'totalVolumeProduced:plan',
    'totalVolumeProduced:real',
    'averageRoutingTime:real',
    'prodBasedPlanners:plan',
    'prodBasedPlanners:real',
    'prodQualityInspection:plan',
    'prodQualityInspection:real',
    'prodOperators:plan',
    'prodOperators:real',
    'prodSetters:plan',
    'prodSetters:real',
    'masters:plan',
    'masters:real',
    'leaders:plan',
    'leaders:real',
    'prodMaterialHandling:plan',
    'prodMaterialHandling:real',
    'kitters:plan',
    'kitters:real',
    'prodTransport:plan',
    'prodTransport:real',
    'cycleCounting:plan',
    'cycleCounting:real',
    'otherWarehousing:plan',
    'otherWarehousing:real',
    'materialQualityInspection:plan',
    'materialQualityInspection:real',
    'maintenance:plan',
    'maintenance:real',
    'timeAvailablePerShift:plan',
    'timeAvailablePerShift:real',
    'routingTimeForLine:plan',
    'routingTimeForLine:real',
    'routingTimeForLabour:plan',
    'routingTimeForLabour:real',
    'heijunkaTimeForLine:plan',
    'breaks:plan',
    'breaks:real',
    'fap0:plan',
    'fap0:real',
    'startup:plan',
    'startup:real',
    'shutdown:plan',
    'shutdown:real',
    'meetings:plan',
    'meetings:real',
    'sixS:plan',
    'sixS:real',
    'tpm:plan',
    'tpm:real',
    'trainings:plan',
    'trainings:real',
    'coTime:plan',
    'coTime:real',
    'downtime:plan',
    'downtime:real',
    'plan:plan',
    'plan:real',
    'efficiency:plan',
    'efficiency:real'
  ];

  return Model.extend({

    defaults: function()
    {
      var today = time.getMoment().startOf('day');
      var to = today.valueOf();
      var defaults = {
        from: today.subtract(7, 'days').valueOf(),
        to: to,
        interval: 'day',
        unit: 'm',
        days: ['1', '2', '3', '4', '5', '6', '7', 'noWork'],
        shifts: ['1', '2', '3'],
        divisions: orgUnits.getAllByType('division')
          .filter(function(d) { return d.get('type') === 'prod'; })
          .map(function(d) { return d.id; }),
        subdivisionTypes: ['assembly', 'press'],
        prodLines: [],
        visibleSeries: {}
      };

      return _.assign(defaults, NUMERIC_PROPS);
    },

    initialize: function()
    {
      this.on('change', function()
      {
        localStorage.setItem('LEAN_FILTER', JSON.stringify(_.omit(this.attributes, 'visibleSeries')));
        localStorage.setItem('LEAN_VISIBLE_SERIES', JSON.stringify(this.attributes.visibleSeries));
      });
    },

    serializeToObject: function()
    {
      var obj = this.toJSON();

      _.forEach(obj, function(value, name)
      {
        if (name === 'visibleSeries' || name === '_rnd')
        {
          obj[name] = undefined;
        }
        else if (_.isArray(value))
        {
          obj[name] = value.join(',');
        }
      });

      return obj;
    },

    serializeToString: function()
    {
      var queryString = '';

      _.forEach(this.attributes, function(value, name)
      {
        if (name === 'visibleSeries' || name === '_rnd')
        {
          return;
        }

        queryString += '&' + name + '=' + value;
      });

      return queryString.substr(1);
    },

    serializeSeriesVisibility: function()
    {
      var result = '';
      var visibleSeries = this.attributes.visibleSeries;

      _.forEach(SERIES, function(seriesId)
      {
        result += visibleSeries[seriesId] ? '1' : '0';
      });

      _.forEach(visibleSeries, function(visible, seriesId)
      {
        if (visible && /^[a-f0-9]{24}/.test(seriesId))
        {
          result += ',' + seriesId.substring(0, 24);
        }
      });

      return result;
    },

    toggleSeriesVisibility: function(id)
    {
      var visibleSeries = this.attributes.visibleSeries;

      visibleSeries[id] = !visibleSeries[id];

      this.trigger('change:visibleSeries');
      this.trigger('change');
    },

    isVisibleSeries: function(id)
    {
      return this.attributes.visibleSeries[id] === true;
    },

    hasAllDivisionsSelected: function()
    {
      var selectedDivisions = this.get('divisions');
      var prodDivisions = orgUnits.getAllByType('division').filter(function(d) { return d.get('type') === 'prod'; });

      return selectedDivisions.length === 0 || selectedDivisions.length === prodDivisions.length;
    }

  }, {

    NUMERIC_PROPS: NUMERIC_PROPS,

    SERIES: SERIES,

    fromRequest: function(query, fragment)
    {
      var attrs = {
        visibleSeries: {}
      };

      if (_.isEmpty(query))
      {
        _.assign(attrs, JSON.parse(localStorage.getItem('LEAN_FILTER') || '{}'));
      }

      _.forEach(query, function(value, name)
      {
        if (ARRAY_PROPS[name])
        {
          value = value === '' ? [] : value.split(',');
        }
        else if (/^[0-9]+$/.test(value))
        {
          value = parseInt(value, 10);
        }

        attrs[name] = value;
      });

      if (fragment.length)
      {
        var hashParts = fragment.split(',');
        var visibleSeries = hashParts.shift();

        _.forEach(SERIES, function(seriesId, i)
        {
          attrs.visibleSeries[seriesId] = visibleSeries.charAt(i) === '1';
        });

        _.forEach(hashParts, function(aorId)
        {
          attrs.visibleSeries[aorId + ':real'] = true;
        });
      }
      else
      {
        attrs.visibleSeries = JSON.parse(localStorage.getItem('LEAN_VISIBLE_SERIES') || '{}');
      }

      return new this(attrs);
    }

  });
});
