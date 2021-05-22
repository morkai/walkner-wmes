// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/templates/userInfo',
  'app/data/prodFunctions',
  'app/kaizenOrders/dictionaries',
  'app/kaizenCategories/templates/detailsCoordSections',
  'i18n!app/nls/kaizenCategories',
  'css!app/kaizenCategories/assets/coordSections'
], function(
  View,
  userInfoTemplate,
  prodFunctions,
  dictionaries,
  template
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'kaizenCategories',

    getTemplateData: function()
    {
      return {
        coordSections: this.model.get('coordSections').map(this.serializeCoordSection, this)
      };
    },

    serializeCoordSection: function(coordSection)
    {
      var section = this.t.has('kaizenCategories', `coordSections:${coordSection.section}`)
        ? this.t('kaizenCategories', `coordSections:${coordSection.section}`)
        : dictionaries.getLabel('section', coordSection.section);

      return {
        section,
        filterSections: coordSection.filterSections.map(s => dictionaries.getLabel('section', s)),
        excludeSections: coordSection.excludeSections,
        coordinators: coordSection.coordinators,
        funcs: coordSection.funcs.map(func =>
        {
          return this.t.has('kaizenCategories', `coordSections:${func}`)
            ? this.t('kaizenCategories', `coordSections:${func}`)
            : prodFunctions.getLabel(func);
        }),
        mor: coordSection.mor,
        users: coordSection.users.map(u => userInfoTemplate(u))
      };
    }

  });
});
