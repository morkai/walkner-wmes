// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/prodFunctions',
  'app/kaizenOrders/dictionaries',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/kaizenProductFamilies/templates/form',
  'app/kaizenProductFamilies/templates/formCoordSection'
], function(
  FormView,
  idAndLabel,
  prodFunctions,
  dictionaries,
  setUpMrpSelect2,
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

      setUpMrpSelect2(this.$id('mrps'), {
        width: '100%'
      });

      (this.model.get('coordSections') || []).forEach(this.addCoordSection, this);
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.mrps = (formData.mrps || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.mrps = (formData.mrps || '').split(',').filter(function(v) { return !!v.length; });

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
