// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/data/divisions',
  'app/core/Model'
], function(
  _,
  t,
  time,
  aors,
  downtimeReasons,
  divisions,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/subdivisions',

    clientUrlRoot: '#subdivisions',

    topicPrefix: 'subdivisions',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'subdivisions',

    labelAttribute: 'name',

    defaults: function()
    {
      return {
        division: null,
        type: 'assembly',
        name: null,
        prodTaskTags: null,
        aor: null,
        autoDowntimes: [],
        deactivatedAt: null
      };
    },

    serialize: function(options)
    {
      var o = this.toJSON();
      var division = divisions.get(o.division);

      if (division)
      {
        o.division = options && options.renderOrgUnitPath
          ? options.renderOrgUnitPath(division, true, false)
          : division.getLabel();
      }

      o.deactivatedAt = o.deactivatedAt ? time.format(o.deactivatedAt, 'LL') : '';
      o.type = t('subdivisions', 'TYPE:' + o.type);
      o.prodTaskTags = o.prodTaskTags && o.prodTaskTags.length ? o.prodTaskTags.join('; ') : null;

      var aor = aors.get(o.aor);
      o.aor = aor ? aor.getLabel() : '';

      o.autoDowntimes = _.map(o.autoDowntimes, function(autoDowntime)
      {
        var reason = downtimeReasons.get(autoDowntime.reason);

        return !reason ? null : {
          reason: reason.getLabel(),
          when: autoDowntime.when,
          time: (autoDowntime.time || []).map(function(time)
          {
            return {
              d: time.d,
              h: (time.h < 10 ? '0' : '') + time.h,
              m: (time.m < 10 ? '0' : '') + time.m
            };
          })
        };
      }).filter(function(autoDowntime)
      {
        return !!autoDowntime;
      });

      return o;
    },

    serializeRow: function(options)
    {
      var obj = this.serialize(options);

      obj.autoDowntimes = obj.autoDowntimes.length === 0 ? '' : obj.autoDowntimes
        .map(function(autoDowntime) { return autoDowntime.reason; })
        .join('; ');

      return obj;
    },

    isActive: function(from)
    {
      var deactivatedAt = this.get('deactivatedAt');

      return !deactivatedAt || ((from || Date.now()) < Date.parse(deactivatedAt));
    },

    getSubdivision: function()
    {
      return this;
    }

  });
});
