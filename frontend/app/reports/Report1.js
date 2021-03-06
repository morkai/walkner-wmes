// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../data/aors',
  '../data/downtimeReasons',
  '../data/orgUnits',
  '../orgUnits/util/renderOrgUnitPath',
  '../core/Model'
], function(
  _,
  t,
  aors,
  downtimeReasons,
  orgUnits,
  renderOrgUnitPath,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/reports/1',

    defaults: function()
    {
      return {
        isParent: false,
        orgUnitType: null,
        orgUnit: null,
        categorizedCoeffs: {
          categories: [],
          quantityDone: [],
          downtime: [],
          scheduledDowntime: [],
          unscheduledDowntime: [],
          efficiency: [],
          productivity: [],
          productivityNoWh: []
        },
        coeffs: {
          quantityDone: [],
          downtime: [],
          scheduledDowntime: [],
          unscheduledDowntime: [],
          efficiency: [],
          productivity: [],
          productivityNoWh: []
        },
        maxCoeffs: {
          quantityDone: 0,
          downtime: 0,
          scheduledDowntime: 0,
          unscheduledDowntime: 0,
          efficiency: 0,
          productivity: 0,
          productivityNoWh: 0
        },
        downtimesByAor: [],
        maxDowntimesByAor: 0,
        downtimesByReason: [],
        maxDowntimesByReason: 0
      };
    },

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error('query option is required!');
      }

      this.query = options.query;
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.assign(
        options.data || {},
        this.query.serializeToObject(this.get('orgUnitType'), this.get('orgUnit'))
      );

      return Model.prototype.fetch.call(this, options);
    },

    isPaintShop: function()
    {
      var subdivision = orgUnits.getSubdivisionFor(this.get('orgUnit'));

      return !!subdivision && subdivision.get('type') === 'paintShop';
    },

    parse: function(report)
    {
      var attributes = {
        categorizedCoeffs: {
          categories: [],
          quantityDone: [],
          downtime: [],
          scheduledDowntime: [],
          unscheduledDowntime: [],
          efficiency: [],
          productivity: [],
          productivityNoWh: [],
          mmh: []
        },
        coeffs: {
          quantityDone: [],
          downtime: [],
          scheduledDowntime: [],
          unscheduledDowntime: [],
          efficiency: [],
          productivity: [],
          productivityNoWh: [],
          mmh: []
        },
        maxCoeffs: {
          quantityDone: 0,
          downtime: 0,
          scheduledDowntime: 0,
          unscheduledDowntime: 0,
          efficiency: 0,
          productivity: 0,
          productivityNoWh: 0
        },
        downtimesByAor: [],
        maxDowntimesByAor: 0,
        downtimesByReason: [],
        maxDowntimesByReason: 0
      };

      this.parseCoeffs(report.coeffs, attributes);
      this.parseDowntimesByAor(report.downtimes.byAor, attributes);
      this.parseDowntimesByReason(report.downtimes.byReason, attributes);

      return attributes;
    },

    parseCoeffs: function(coeffsList, attrs)
    {
      var categorized = attrs.categorizedCoeffs;
      var uncategorized = attrs.coeffs;
      var extremes = attrs.maxCoeffs;
      var subdivision = orgUnits.getSubdivisionFor(this.get('orgUnit'));
      var assembly = subdivision && subdivision.get('type') === 'assembly';

      for (var i = 0, l = coeffsList.length; i < l; ++i)
      {
        var coeffs = coeffsList[i];
        var orderCount = coeffs.orderCount || 0;
        var quantityDone = coeffs.quantityDone || 0;
        var mmh = coeffs.mmh || 0;
        var time = Date.parse(coeffs.key);

        pushValue(uncategorized, 'quantityDone', time, quantityDone);
        pushPercentValue(uncategorized, 'downtime', time, coeffs.downtime);
        pushPercentValue(uncategorized, 'scheduledDowntime', time, coeffs.scheduledDowntime);
        pushPercentValue(uncategorized, 'unscheduledDowntime', time, coeffs.unscheduledDowntime);
        pushPercentValue(uncategorized, 'efficiency', time, coeffs.efficiency);
        pushPercentValue(uncategorized, 'productivity', time, coeffs.productivity);
        pushPercentValue(uncategorized, 'productivityNoWh', time, coeffs.productivityNoWh);
        pushValue(uncategorized, 'mmh', time, mmh);

        if (orderCount === 0 || (assembly && quantityDone === 0))
        {
          continue;
        }

        categorized.categories.push(time);

        pushValue(categorized, 'quantityDone', time, quantityDone);
        pushPercentValue(categorized, 'downtime', time, coeffs.downtime);
        pushPercentValue(categorized, 'scheduledDowntime', time, coeffs.scheduledDowntime);
        pushPercentValue(categorized, 'unscheduledDowntime', time, coeffs.unscheduledDowntime);
        pushPercentValue(categorized, 'efficiency', time, coeffs.efficiency);
        pushPercentValue(categorized, 'productivity', time, coeffs.productivity);
        pushPercentValue(categorized, 'productivityNoWh', time, coeffs.productivityNoWh);
        pushValue(categorized, 'mmh', time, mmh);
      }

      function pushValue(series, coeff, time, value)
      {
        if (series === categorized)
        {
          series[coeff].push({y: value, time: time});
        }
        else
        {
          series[coeff].push({x: time, y: value});
        }

        if (value > extremes[coeff])
        {
          extremes[coeff] = value;
        }
      }

      function pushPercentValue(series, coeff, time, value)
      {
        pushValue(series, coeff, time, Math.round((value || 0) * 100));
      }
    },

    parseDowntimesByAor: function(downtimes, attributes)
    {
      if (!downtimes)
      {
        return;
      }

      var aorIds = Object.keys(downtimes);

      for (var i = 0, l = aorIds.length; i < l; ++i)
      {
        var aorId = aorIds[i];
        var longText;
        var shortText;

        if (aorId === 'null')
        {
          longText = t('reports', 'downtimesByAor:press:longText');
          shortText = t('reports', 'downtimesByAor:press:shortText');
        }
        else
        {
          var aor = aors.get(aorId);

          if (aor)
          {
            longText = aor.getLabel();
          }
          else
          {
            longText = aorId;
          }

          var dashPos = longText.indexOf('-');

          if (dashPos === -1)
          {
            shortText = longText > 13 ? (longText.substr(0, 10).trim() + '...') : longText;
          }
          else
          {
            shortText = longText.substr(0, dashPos).trim();
          }
        }

        var value = Math.round(downtimes[aorId] * 100) / 100;

        attributes.downtimesByAor.push({
          key: aorId,
          longText: longText,
          shortText: shortText,
          value: value
        });

        if (value > attributes.maxDowntimesByAor)
        {
          attributes.maxDowntimesByAor = value;
        }
      }

      attributes.downtimesByAor.sort(function(a, b) { return b.value - a.value; });
    },

    parseDowntimesByReason: function(downtimes, attributes)
    {
      if (!downtimes)
      {
        return;
      }

      var reasonIds = Object.keys(downtimes);

      for (var i = 0, l = reasonIds.length; i < l; ++i)
      {
        var reasonId = reasonIds[i];
        var downtimeReason = downtimeReasons.get(reasonId);
        var value = Math.round(downtimes[reasonId] * 100) / 100;

        attributes.downtimesByReason.push({
          key: reasonId,
          longText: downtimeReason ? downtimeReason.getLabel() : reasonId,
          shortText: reasonId,
          value: value
        });

        if (value > attributes.maxDowntimesByReason)
        {
          attributes.maxDowntimesByReason = value;
        }
      }

      attributes.downtimesByReason.sort(function(a, b) { return b.value - a.value; });
    },

    getOrgUnitTitle: function()
    {
      var orgUnitType = this.get('orgUnitType');

      if (!orgUnitType)
      {
        return t('reports', 'charts:title:overall');
      }

      var orgUnit = this.get('orgUnit');

      if (orgUnitType === 'subdivision')
      {
        return renderOrgUnitPath(orgUnit, false, false);
      }

      return orgUnit.getLabel();
    },

    getMaxDowntimesByAor: function(visibleAors, visibleReferences)
    {
      return this.getMaxDowntimesValue(visibleAors, visibleReferences, aors, 'downtimesByAor');
    },

    getMaxDowntimesByReason: function(visibleReasons, visibleReferences)
    {
      return this.getMaxDowntimesValue(visibleReasons, visibleReferences, downtimeReasons, 'downtimesByReason');
    },

    getMaxDowntimesValue: function(visibleColumns, visibleReferences, refValueCollection, property)
    {
      var max = 0;

      this.get(property).forEach(function(downtime)
      {
        if (!visibleColumns[downtime.key])
        {
          return;
        }

        if (downtime.value > max)
        {
          max = downtime.value;
        }

        var refValueModel = refValueCollection.get(downtime.key);

        if (!refValueModel || !visibleReferences[downtime.key])
        {
          return;
        }

        var refValue = refValueModel.get('refValue');

        if (refValue > max)
        {
          max = refValue;
        }
      });

      return max;
    },

    getReferenceOrgUnitId: function()
    {
      var orgUnitType = this.get('orgUnitType');
      var orgUnit = this.get('orgUnit');
      var subdivisionType = this.query.get('subdivisionType');

      if (orgUnitType === null)
      {
        return subdivisionType || 'overall';
      }

      if (orgUnitType === 'division')
      {
        return this.getReferenceOrgUnitIdByDivision(subdivisionType, orgUnit);
      }

      if (orgUnitType === 'subdivision')
      {
        return orgUnit.id;
      }

      var subdivision = orgUnits.getSubdivisionFor(orgUnit);

      return subdivision ? subdivision.id : null;
    },

    getReferenceOrgUnitIdByDivision: function(subdivisionType, orgUnit)
    {
      if (subdivisionType === null)
      {
        return orgUnit.id;
      }

      if (subdivisionType === 'prod')
      {
        subdivisionType = 'assembly';
      }

      var subdivisions = orgUnits.getChildren(orgUnit).filter(function(subdivision)
      {
        return subdivision.get('type') === subdivisionType;
      });

      return subdivisions.length ? subdivisions[0].id : null;
    },

    isEmpty: function()
    {
      return this.get('coeffs').efficiency.length === 0;
    }

  });
});
