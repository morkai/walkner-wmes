// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/controlLists',

    clientUrlRoot: '#kaizenControlLists',

    topicPrefix: 'kaizen.controlLists',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenControlLists',

    labelAttribute: 'name',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var o = this.toJSON();

      o.active = t('core', 'BOOL:' + o.active);

      return o;
    }

  });
});
