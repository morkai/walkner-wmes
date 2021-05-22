// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/prodFunctions',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/kaizenCategories/templates/formCoordSections',
  'app/kaizenCategories/templates/formCoordSection',
  'i18n!app/nls/kaizenCategories',
  'css!app/kaizenCategories/assets/coordSections'
], function(
  View,
  idAndLabel,
  prodFunctions,
  setUpUserSelect2,
  dictionaries,
  template,
  coordSectionTemplate
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'kaizenCategories',

    events: {

      'click [data-action="addCoordSection"]': function()
      {
        this.addCoordSection({
          section: null,
          filterSections: [],
          excludeSections: false,
          coordinators: true,
          funcs: [],
          mor: 'none',
          users: []
        });
      },

      'click [data-action="removeCoordSection"]': function(e)
      {
        var $row = this.$(e.target).closest('.kaizen-coordSections-section');

        $row.find('input[tabindex="-1"]').select2('destroy');
        $row.remove();
      }

    },

    initialize: function()
    {
      this.coordSectionI = 0;
    },

    afterRender: function()
    {
      (this.model.get('coordSections') || []).forEach(this.addCoordSection, this);
    },

    serializeForm: function(formData)
    {
      const $users = this.$('input[name$=".users"]');

      formData.coordSections = (formData.coordSections || [])
        .filter(s => !!s.section)
        .map((s, i) =>
        {
          const funcs = (s.funcs || '').split(',').filter(f => !!f);

          return {
            section: s.section,
            filterSections: (s.filterSections || '').split(',').filter(s => !!s),
            excludeSections: s.excludeSections === true,
            coordinators: s.coordinators === true,
            funcs,
            mor: funcs.length ? s.mor : 'none',
            users: setUpUserSelect2.getUserInfo($users.eq(i))
          };
        });

      return formData;
    },

    addCoordSection: function(coordSection)
    {
      var $row = this.renderPartial(coordSectionTemplate, {
        i: this.coordSectionI++,
        coordSection
      });

      this.$id('coordSections').append($row);

      var sections = dictionaries.sections.map(idAndLabel);

      $row.find('input[name$=".section"]').select2({
        width: '300px',
        data: [{
          id: '_section',
          text: this.t('coordSections:_section')
        }].concat(sections)
      });

      $row.find('input[name$=".filterSections"]').select2({
        width: '300px',
        multiple: true,
        data: sections
      });

      var funcs = [{
        id: '_confirmer',
        text: this.t('coordSections:_confirmer')
      }, {
        id: '_superior',
        text: this.t('coordSections:_superior')
      }].concat(prodFunctions.map(idAndLabel));

      $row.find('input[name$=".funcs"]').select2({
        width: '300px',
        multiple: true,
        data: funcs
      });

      setUpUserSelect2($row.find('input[name$=".users"]'), {
        width: '300px',
        multiple: true,
        currentUserInfo: coordSection.users
      });
    }

  });
});
