// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/d8EntrySources/templates/form'
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
    }

  });
});
