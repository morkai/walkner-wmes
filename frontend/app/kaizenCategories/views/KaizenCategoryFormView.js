// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/prodFunctions',
  'app/kaizenOrders/dictionaries',
  'app/kaizenCategories/templates/form',
  'app/kaizenCategories/templates/formCoordSection'
], function(
  FormView,
  idAndLabel,
  prodFunctions,
  dictionaries,
  template,
  coordSectionTemplate
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: Object.assign({

      'click [data-action="addCoordSection"]': function()
      {
        this.addCoordSection({
          section: null,
          funcs: [],
          mor: 'none'
        });
      },

      'click [data-action="removeCoordSection"]': function(e)
      {
        var $row = this.$(e.target).closest('tr');

        $row.find('input[tabindex="-1"]').select2('destroy');
        $row.remove();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.coordSectionI = 0;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('_id').prop('readonly', true);
        this.$id('name').focus();
      }

      (this.model.get('coordSections') || []).forEach(this.addCoordSection, this);
    },

    serializeForm: function(formData)
    {
      if (!formData.description)
      {
        formData.description = '';
      }

      formData.inNearMiss = !!formData.inNearMiss;
      formData.inSuggestion = !!formData.inSuggestion;

      formData.coordSections = (formData.coordSections || [])
        .filter(function(s) { return !!s.section; })
        .map(function(s)
        {
          var funcs = (s.funcs || '').split(',').filter(function(f) { return !!f; });

          return {
            section: s.section,
            funcs: funcs,
            mor: funcs.length ? s.mor : 'none'
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

      $row.find('input[name$=".section"]').select2({
        width: '300px',
        data: dictionaries.sections.map(idAndLabel)
      });

      $row.find('input[name$=".funcs"]').select2({
        width: '525px',
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });
    }

  });
});
