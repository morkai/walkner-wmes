// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  '../ComponentLabel',
  'app/componentLabels/templates/form'
], function(
  FormView,
  idAndLabel,
  orgUnits,
  ComponentLabel,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    getTemplateData: function()
    {
      return {
        TEMPLATES: ComponentLabel.TEMPLATES
      };
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('lines').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        placeholder: ' ',
        data: orgUnits.getActiveByType('prodLine').map(idAndLabel)
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.lines = (formData.lines || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.lines = (formData.lines || '').split(',').filter(id => id.length);

      return formData;
    },

    handleFailure: function(jqXhr)
    {
      var code = jqXhr.responseJSON
        && jqXhr.responseJSON.error
        && jqXhr.responseJSON.error.code;

      if (code === 'DUPLICATE_KEY')
      {
        return this.showErrorMessage(this.t('FORM:ERROR:duplicate'));
      }

      return FormView.prototype.handleFailure.apply(this, arguments);
    }

  });
});
