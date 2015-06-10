// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
        aors: null,
        statuses: null,
        limit: 8,
        skip: 0
      };
    },

    setDefaults: function(aors, statuses)
    {
      var changes = {};

      if (this.get('aors') === null)
      {
        changes.aors = aors;
      }

      if (this.get('statuses') === null)
      {
        changes.statuses = statuses;
      }

      this.set(changes, {silent: true});
    },

    serializeToObject: function()
    {
      return {
        aors: (this.get('aors') || []).join(','),
        statuses: 'confirmed'
      };
    },

    serializeToString: function()
    {
      var queryString = '';
      var attrs = this.attributes;

      if (attrs.aors)
      {
        queryString += '&aors=' + attrs.aors;
      }

      queryString += '&statuses=' + attrs.statuses;
      queryString += '&limit=' + attrs.limit;
      queryString += '&skip=' + attrs.skip;

      return queryString.substr(1);
    },

    createProdDowntimesSelector: function()
    {
      var startedAt = time.getMoment().startOf('month').hours(6);
      var statuses = this.get('statuses') || [];
      var aors = this.get('aors') || [];
      var selector = {
        name: 'and',
        args: []
      };

      selector.args.push({
        name: 'ge',
        args: ['startedAt', startedAt.valueOf()]
      }, {
        name: 'lt',
        args: ['startedAt', startedAt.add(1, 'months').valueOf()]
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
    }

  }, {

    prepareAttrsFromQuery: function(query)
    {
      return {
        aors: query.aors ? query.aors.split(',') : null,
        statuses: query.statuses ? query.statuses.split(',') : null,
        limit: parseInt(query.limit, 10) || undefined,
        skip: parseInt(query.skip, 10) || undefined
      };
    },

    fromQuery: function(query)
    {
      return new this(this.prepareAttrsFromQuery(query));
    }

  });
});
