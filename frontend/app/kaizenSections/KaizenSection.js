// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/data/orgUnits'
], function(
  _,
  t,
  Model,
  userInfoTemplate,
  orgUnits
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/sections',

    clientUrlRoot: '#kaizenSections',

    topicPrefix: 'kaizen.sections',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenSections',

    labelAttribute: 'name',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var o = this.toJSON();

      o.active = t('core', 'BOOL:' + o.active);

      o.subdivisions = _.map(o.subdivisions, function(s)
      {
        s = orgUnits.getByTypeAndId('subdivision', s);

        return s
          ? (s.get('division') + ' \\ ' + s.get('name'))
          : '';
      }).filter(function(s) { return !!s.length; }).join('; ');

      o.coordinators = _.map(
        o.coordinators,
        function(u) { return userInfoTemplate({userInfo: u}); }
      ).join(', ');

      return o;
    }

  });
});
