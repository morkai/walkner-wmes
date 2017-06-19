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

    urlRoot: '/kaizen/categories',

    clientUrlRoot: '#kaizenCategories',

    topicPrefix: 'kaizen.categories',

    privilegePrefix: 'KAIZEN:DICTIONARIES',

    nlsDomain: 'kaizenCategories',

    labelAttribute: 'name',

    defaults: {},

    serialize: function()
    {
      var obj = this.toJSON();

      if (!obj.description)
      {
        obj.description = '-';
      }

      obj.inNearMiss = t('core', 'BOOL:' + this.get('inNearMiss'));
      obj.inSuggestion = t('core', 'BOOL:' + this.get('inSuggestion'));

      return obj;
    }

  });
});
