// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView',
  'app/events/templates/list'
], function(
  _,
  time,
  t,
  divisions,
  subdivisions,
  renderOrgUnitPath,
  ListView,
  listTemplate
) {
  'use strict';

  return ListView.extend({

    template: listTemplate,

    remoteTopics: {
      'events.saved': 'refreshCollection'
    },

    serialize: function()
    {
      var view = this;

      return {
        events: this.collection.map(function(event)
        {
          var type = event.get('type');
          var data = view.prepareData(type, event.get('data'));

          return {
            severity: event.getSeverityClassName(),
            time: time.format(event.get('time'), 'lll'),
            user: event.get('user'),
            type: t('events', 'TYPE:' + type),
            text: t('events', 'TEXT:' + type, view.flatten(data))
          };
        })
      };
    },

    refreshCollection: function(events, force)
    {
      if (typeof this.options.filter === 'function'
        && Array.isArray(events)
        && !events.some(this.options.filter))
      {
        return;
      }

      return ListView.prototype.refreshCollection.call(this, events, force);
    },

    prepareData: function(type, data)
    {
      /*jshint -W015*/

      if (data.$prepared)
      {
        return data;
      }

      data.$prepared = true;

      switch (type)
      {
        case 'fte.leader.created':
        case 'fte.leader.locked':
        case 'fte.leader.deleted':
        case 'fte.master.created':
        case 'fte.master.locked':
        case 'fte.master.deleted':
          var subdivision = subdivisions.get(data.model.subdivision);

          data.model.subdivision = subdivision ? renderOrgUnitPath(subdivision, false, false) : '?';
          data.model.date = time.format(data.model.date, 'YYYY-MM-DD');
          data.model.shift = t('core', 'SHIFT:' + data.model.shift);
          break;

        case 'hourlyPlans.created':
        case 'hourlyPlans.locked':
        case 'hourlyPlans.deleted':
          var division = divisions.get(data.model.division);

          data.model.division = division ? renderOrgUnitPath(division, false, false) : '?';
          data.model.date = time.format(data.model.date, 'YYYY-MM-DD');
          data.model.shift = t('core', 'SHIFT:' + data.model.shift);
          break;

        case 'clipOrderCount.created':
        case 'warehouse.shiftMetrics.synced':
        case 'warehouse.shiftMetrics.syncFailed':
          data.date = time.format(data.date, 'YYYY-MM-DD');
          break;

        case 'warehouse.controlCycles.synced':
        case 'warehouse.controlCycles.syncFailed':
        case 'warehouse.transferOrders.synced':
        case 'warehouse.transferOrders.syncFailed':
        case 'xiconf.orders.synced':
          data.timestamp = time.format(data.timestamp, 'YYYY-MM-DD, HH:mm:ss');
          break;

        case 'purchaseOrders.synced':
          data.importedAt = time.format(data.importedAt, 'LLL');
          break;
      }

      return data;
    },

    flatten: function(obj)
    {
      var result = {};

      if (obj == null)
      {
        return result;
      }

      var keys = Object.keys(obj);

      for (var i = 0, l = keys.length; i < l; ++i)
      {
        var key = keys[i];
        var value = obj[key];

        if (value !== null && typeof value === 'object')
        {
          var flatObj = this.flatten(value);
          var flatKeys = Object.keys(flatObj);

          for (var ii = 0, ll = flatKeys.length; ii < ll; ++ii)
          {
            result[key + '->' + flatKeys[ii]] = String(flatObj[flatKeys[ii]]);
          }
        }
        else
        {
          result[key] = _.escape(String(value));
        }
      }

      return result;
    }

  });
});
