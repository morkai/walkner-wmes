// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../user',
  '../core/Model',
  '../data/orgUnits',
  '../data/localStorage'
], function(
  _,
  user,
  Model,
  orgUnits,
  localStorage
) {
  'use strict';

  var STORAGE_KEY = 'ProdLineStateDisplayOptions';

  return Model.extend({

    defaults: function()
    {
      return {
        orgUnitType: null,
        orgUnitIds: null,
        statuses: ['online', 'offline'],
        states: ['idle', 'working', 'downtime'],
        blacklisted: false,
        from: null,
        to: null,
        shifts: ['1', '2', '3']
      };
    },

    serializeToString: function()
    {
      var attrs = this.attributes;

      var str = 'statuses=' + attrs.statuses
        + '&states=' + attrs.states
        + '&orgUnitType=' + attrs.orgUnitType
        + '&orgUnitIds=' + attrs.orgUnitIds.map(encodeURIComponent);

      if (attrs.blacklisted)
      {
        str += '&blacklisted=1';
      }

      if (attrs.from && attrs.to)
      {
        str += '&from=' + attrs.from + '&to=' + attrs.to + '&shifts=' + attrs.shifts;
      }

      return str;
    },

    isVisible: function(prodLineState)
    {
      if (this.isHistoryData())
      {
        return true;
      }

      var attrs = this.attributes;

      return attrs.statuses.indexOf(prodLineState.get('online') ? 'online' : 'offline') !== -1
        && attrs.states.indexOf(prodLineState.get('state') || 'idle') !== -1
        && orgUnits.containsProdLine(attrs.orgUnitType, attrs.orgUnitIds, prodLineState.id);
    },

    save: function()
    {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.attributes));
    },

    haveHistoryOptionsChanged: function()
    {
      var changes = this.changedAttributes();

      return changes.from !== undefined
        || changes.to !== undefined
        || changes.shifts !== undefined
        || changes.orgUnitIds !== undefined;
    },

    isHistoryData: function()
    {
      return this.attributes.from !== null && this.attributes.to !== null;
    }

  }, {

    fromQuery: function(query)
    {
      var attrs = {
        orgUnitType: query.orgUnitType,
        orgUnitIds: query.orgUnitIds ? query.orgUnitIds.split(',') : undefined,
        statuses: query.statuses ? query.statuses.split(',') : undefined,
        states: query.states ? query.states.split(',') : undefined,
        blacklisted: query.blacklisted === undefined ? undefined : query.blacklisted === '1',
        from: parseInt(query.from, 10) || undefined,
        to: parseInt(query.to, 10) || undefined,
        shifts: query.shifts ? query.shifts.split(',') : undefined
      };

      var savedOptions = localStorage.getItem(STORAGE_KEY);

      if (savedOptions)
      {
        _.defaults(attrs, JSON.parse(savedOptions));
      }

      if (!attrs.orgUnitType)
      {
        if (user.data.orgUnitType)
        {
          attrs.orgUnitType = user.data.orgUnitType;
          attrs.orgUnitIds = [user.data.orgUnitId];
        }
        else
        {
          attrs.orgUnitType = 'prodLine';
          attrs.orgUnitIds = [];
        }
      }

      return new this(attrs);
    }

  });
});
