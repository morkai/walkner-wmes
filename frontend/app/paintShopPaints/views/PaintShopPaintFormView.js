// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/paintShopPaints/templates/form'
], function(
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      if (this.options.editMode)
      {
        this.$id('_id').prop('readonly', true);
        this.$id('shelf').focus();
      }
      else
      {
        this.$id('_id').focus();
      }
    }

  });
});
