// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../user',
  '../core/Model',
  '../data/orgUnits'
], function(
  _,
  user,
  Model,
  orgUnits
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
        blacklisted: false
      };
    },

    serializeToString: function()
    {
      var attrs = this.attributes;

      return 'statuses=' + attrs.statuses
        + '&states=' + attrs.states
        + '&blacklisted=' + (attrs.blacklisted ? '1' : '0')
        + '&orgUnitType=' + attrs.orgUnitType
        + '&orgUnitIds=' + attrs.orgUnitIds.map(encodeURIComponent);
    },

    isVisible: function(prodLineState)
    {
      var attrs = this.attributes;

      return attrs.statuses.indexOf(prodLineState.get('online') ? 'online' : 'offline') !== -1
        && attrs.states.indexOf(prodLineState.get('state') || 'idle') !== -1
        && orgUnits.containsProdLine(attrs.orgUnitType, attrs.orgUnitIds, prodLineState.id);
    },

    save: function()
    {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.attributes));
    }

  }, {

    fromQuery: function(query)
    {
      var attrs = {
        orgUnitType: query.orgUnitType,
        orgUnitIds: query.orgUnitIds ? query.orgUnitIds.split(',') : undefined,
        statuses: query.statuses ? query.statuses.split(',') : undefined,
        states: query.states ? query.states.split(',') : undefined,
        blacklisted: query.blacklisted === undefined ? undefined : query.blacklisted === '1'
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
