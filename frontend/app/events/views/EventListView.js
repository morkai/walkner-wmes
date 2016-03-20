// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
            text: t('events', 'TEXT:' + type, t.flatten(data))
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

      if (data.date)
      {
        data.date = time.format(data.date, 'YYYY-MM-DD');
      }

      if (data.timestamp)
      {
        data.timestamp = time.format(data.timestamp, 'YYYY-MM-DD, HH:mm:ss');
      }

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

        case 'purchaseOrders.synced':
          data.importedAt = time.format(data.importedAt, 'LLL');
          break;
      }

      return data;
    }

  });
});
