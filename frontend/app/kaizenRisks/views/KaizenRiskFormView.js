// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/kaizenRisks/templates/form'
], function(
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('id').prop('readonly', true);
        this.$id('name').focus();
      }
    },

    serializeForm: function(formData)
    {
      if (!formData.description)
      {
        formData.description = '';
      }

      return formData;
    }

  });
});
