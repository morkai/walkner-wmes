// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/FormView',
  'app/wh-deliveredOrders/templates/form'
], function(
  viewport,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    handleSuccess: function()
    {
      viewport.closeDialog();
    },

    getFailureText: function()
    {
      return this.t('FORM:edit:failure');
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.blocked = formData.status === 'blocked';

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.qtyTodo = parseInt(formData.qtyTodo, 10);
      formData.qtyDone = parseInt(formData.qtyDone, 10);

      return formData;
    }

  });
});
