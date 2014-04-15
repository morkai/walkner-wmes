// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/data/companies',
  'app/core/views/FormView',
  'app/prodFunctions/templates/form'
], function(
  _,
  companies,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
        this.$('.form-control[name=label]').focus();
      }

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
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.companies = formData.companies.join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.companies = (formData.companies || '').split(',');

      return formData;
    }

  });
});
