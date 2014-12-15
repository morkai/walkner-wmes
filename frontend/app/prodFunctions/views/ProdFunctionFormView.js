// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/data/companies',
  'app/core/views/FormView',
  'app/core/templates/colorPicker',
  'app/prodFunctions/templates/form',
  'bootstrap-colorpicker'
], function(
  _,
  companies,
  FormView,
  colorPickerTemplate,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.extend({}, FormView.prototype.events, {
      'change [name=direct]': 'toggleDirIndirRatio',
      'change [name=color]': 'updateColorPicker'
    }),

    destroy: function()
    {
      this.$('.colorpicker-component').colorpicker('destroy');
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
        this.$('.form-control[name=label]').focus();
      }

      this.$id('color').parent().colorpicker();

      this.$id('companies').select2({
        allowClear: true,
        multiple: true,
        data: companies.map(function(company)
        {
          return {
            id: company.id,
            text: company.getLabel()
          };
        })
      });

      this.toggleDirIndirRatio();
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        renderColorPicker: colorPickerTemplate
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.companies = formData.companies.join(',');
      formData.direct += '';

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.companies = (formData.companies || '').split(',');

      return formData;
    },

    toggleDirIndirRatio: function()
    {
      this.$id('dirIndirRatio').prop('readonly', this.$('[name=direct]:checked').val() === 'false');
    },

    updateColorPicker: function(e)
    {
      if (e.originalEvent)
      {
        this.$(e.target).closest('.colorpicker-component').colorpicker('setValue', e.target.value);
      }
    }

  });
});
