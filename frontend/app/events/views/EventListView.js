// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/views/ListView',
  'app/events/templates/list',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  t,
  divisions,
  subdivisions,
  renderOrgUnitPath,
  ListView,
  listTemplate,
  userInfoTemplate
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
          var user = event.get('user');
          var userInfo = null;

          if (user)
          {
            userInfo = {
              id: user._id,
              label: user.name,
              ip: user.ipAddress
            };
          }

          return {
            severity: event.getSeverityClassName(),
            time: time.format(event.get('time'), 'L, LTS'),
            user: userInfoTemplate({userInfo: userInfo}),
            type: t('events', 'TYPE:' + type),
            text: t('events', 'TEXT:' + data.$text, t.flatten(data))
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
      if (data.$prepared)
      {
        return data;
      }

      data.$prepared = true;
      data.$text = type;

      if (data.date)
      {
        data.dateUtc = time.utc.format(data.date, 'L');
        data.date = time.format(data.date, 'L');
      }

      if (data.timestamp)
      {
        data.timestamp = time.format(data.timestamp, 'L, LTS');
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

          data.model._subdivision = subdivision ? renderOrgUnitPath(subdivision, false, false) : '?';
          data.model.date = time.format(data.model.date, 'L');
          data.model.shift = t('core', 'SHIFT:' + data.model.shift);
          break;

        case 'hourlyPlans.created':
        case 'hourlyPlans.locked':
        case 'hourlyPlans.deleted':
          var division = divisions.get(data.model.division);

          data.model._division = division ? renderOrgUnitPath(division, false, false) : '?';
          data.model.date = time.format(data.model.date, 'L');
          data.model.shift = t('core', 'SHIFT:' + data.model.shift);
          break;

        case 'purchaseOrders.synced':
          data.importedAt = time.format(data.importedAt, 'LLL');
          break;

        case 'orders.synced':
          data.removed = data.removed || 0;
          break;

        case 'orderDocuments.synced':
          if (data.minDate)
          {
            if (data.minDate === data.maxDate)
            {
              data.$text += ':date';
            }
            else
            {
              data.$text += ':minMax';
            }

            data.minDate = time.format(data.minDate, 'L');
            data.maxDate = time.format(data.maxDate, 'L');
          }
      }

      return data;
    }

  });
});
