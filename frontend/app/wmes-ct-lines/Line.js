// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/ct/lines',

    clientUrlRoot: '#ct/lines',

    topicPrefix: 'ct.lines',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'wmes-ct-lines',

    defaults: function()
    {
      return {
        active: true,
        type: 'inveo',
        common: {},
        stations: []
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', 'BOOL:' + obj.active);
      obj.type = t(this.nlsDomain, 'type:' + obj.type);
      obj.stationCount = Array.isArray(obj.stations) ? obj.stations.length : 0;

      return obj;
    }

  });
});
