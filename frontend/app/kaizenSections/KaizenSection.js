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
      var dictionaries = require('app/kaizenOrders/dictionaries');
      var o = this.toJSON();

      o.active = t('core', 'BOOL:' + o.active);

      o.entryTypes = o.entryTypes.map(function(id) { return t('kaizenSections', 'entryType:' + id); });

      o.subdivisions = _.map(o.subdivisions, function(id)
      {
        var s = orgUnits.getByTypeAndId('subdivision', id);

        return s
          ? (s.get('division') + ' \\ ' + s.get('name'))
          : id;
      });

      o.confirmers = _.map(o.confirmers, userInfoTemplate);
      o.coordinators = _.map(o.coordinators, userInfoTemplate);
      o.auditors = _.map(o.auditors, userInfoTemplate);
      o.controlLists = _.map(o.controlLists, function(id) { return dictionaries.controlLists.getLabel(id); });

      return o;
    },

    serializeRow: function()
    {
      var row = this.serialize();

      row.entryTypes = row.entryTypes.join('; ');

      return row;
    }

  });
});
