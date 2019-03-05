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

    urlRoot: '/qi/reports/count',

    nlsDomain: 'qiResults',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        interval: 'month',
        productFamilies: [],
        kinds: [],
        errorCategories: [],
        faultCodes: [],
        inspector: '',
        divisions: {},
        selectedGroupKey: null,
        groups: {},
        ignoredDivisions: {}
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
          'from', 'to', 'interval', 'productFamilies', 'kinds', 'errorCategories', 'faultCodes', 'inspector'
        ])
      );

      data.kinds = data.kinds.join(',');
      data.errorCategories = data.errorCategories.join(',');
      data.faultCodes = data.faultCodes.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/qi/reports/count'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval')
        + '&productFamilies=' + this.get('productFamilies')
        + '&kinds=' + this.get('kinds')
        + '&errorCategories=' + this.get('errorCategories')
        + '&faultCodes=' + this.get('faultCodes')
        + '&inspector=' + this.get('inspector');
    },

    parse: function(report)
    {
      return {
        divisions: report.divisions,
        selectedGroupKey: null,
        groups: report.groups
      };
    },

    getSelectedGroup: function()
    {
      var selectedGroupKey = this.get('selectedGroupKey');
      var groups = this.get('groups');

      return selectedGroupKey
        ? _.find(groups, function(g) { return g.key === selectedGroupKey; })
        : groups[0];
    },

    selectNearestGroup: function(x)
    {
      var groups = this.get('groups');
      var selectedGroupKey = null;

      for (var i = 0; i < groups.length; ++i)
      {
        var currentX = groups[i].key;
        var nextGroup = groups[i + 1];

        if (!nextGroup || x < currentX)
        {
          selectedGroupKey = currentX;

          break;
        }

        var nextX = nextGroup.key;

        if (x >= currentX && x < nextX)
        {
          selectedGroupKey = currentX;

          break;
        }
      }

      this.set('selectedGroupKey', selectedGroupKey);
    },

    toggleDivision: function(division, state)
    {
      var ignoredDivisions = _.clone(this.attributes.ignoredDivisions);

      if (state)
      {
        delete ignoredDivisions[division];
      }
      else
      {
        ignoredDivisions[division] = true;
      }

      this.set('ignoredDivisions', ignoredDivisions);
    },

    hasAnyIgnoredDivisions: function()
    {
      return !_.isEmpty(this.attributes.ignoredDivisions);
    },

    isIgnoredDivision: function(division)
    {
      return !!this.attributes.ignoredDivisions[division];
    }

  }, {

    fromQuery: function(query)
    {
      var from = +query.from;
      var to = +query.to;

      if (!from && !to)
      {
        from = time.getMoment().startOf('month').subtract(6, 'months').valueOf();
      }

      return new this({
        from: from || 0,
        to: to || 0,
        interval: query.interval || undefined,
        productFamilies: _.isEmpty(query.productFamilies) ? '' : query.productFamilies,
        kinds: _.isEmpty(query.kinds) ? [] : query.kinds.split(','),
        errorCategories: _.isEmpty(query.errorCategories) ? [] : query.errorCategories.split(','),
        faultCodes: _.isEmpty(query.faultCodes) ? [] : query.faultCodes.split(','),
        inspector: _.isEmpty(query.inspector) ? '' : query.inspector
      });
    }

  });
});
