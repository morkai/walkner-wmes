define([
  'underscore',
  'moment',
  'app/i18n',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView',
  'app/events/templates/list',
  'i18n!app/nls/events'
], function(
  _,
  moment,
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
            time: moment(event.get('time')).format('lll'),
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
          var subdivision = subdivisions.get(data.model.subdivision);

          data.model.subdivision = subdivision ? renderOrgUnitPath(subdivision, false, false) : '?';
          data.model.date = moment(data.model.date).format('YYYY-MM-DD');
          break;

        case 'fte.master.created':
        case 'fte.master.locked':
          var division = divisions.get(data.model.division);

          data.model.division = division ? renderOrgUnitPath(division, false, false) : '?';
          data.model.date = moment(data.model.date).format('YYYY-MM-DD');
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
