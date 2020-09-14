// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/i18n',
  'app/core/Model',
  'app/data/prodFunctions'
], function(
  require,
  t,
  Model,
  prodFunctions
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
      var dictionaries = require('app/kaizenOrders/dictionaries');
      var obj = this.toJSON();

      if (!obj.description)
      {
        obj.description = '';
      }

      obj.active = t('core', 'BOOL:' + obj.active);
      obj.inNearMiss = t('core', 'BOOL:' + obj.inNearMiss);
      obj.inSuggestion = t('core', 'BOOL:' + obj.inSuggestion);

      obj.coordSections = (obj.coordSections || []).map(function(coordSection)
      {
        return {
          section: dictionaries.getLabel('section', coordSection.section),
          funcs: coordSection.funcs.map(function(func)
          {
            var prodFunction = prodFunctions.get(func);

            return prodFunction ? prodFunction.getLabel() : func;
          }),
          mor: coordSection.mor
        };
      });

      return obj;
    }

  });
});
