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

    urlRoot: '/kaizen/categories',

    clientUrlRoot: '#kaizenCategories',

    topicPrefix: 'kaizen.categories',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenCategories',

    labelAttribute: 'name',

    defaults: {
      active: true
    },

    serialize: function()
    {
      var model = this;
      var obj = model.toJSON();

      if (!obj.description)
      {
        obj.description = '';
      }

      obj.active = t('core', 'BOOL:' + obj.active);
      obj.inNearMiss = t('core', 'BOOL:' + obj.inNearMiss);
      obj.inSuggestion = t('core', 'BOOL:' + obj.inSuggestion);

      return obj;
    }

  });
});
