define([
  'underscore',
  'app/core/views/FormView',
  'app/divisions/templates/form'
], function(
  _,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'divisionForm',

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('_id').attr('disabled', true);
      }
    }

  });
});
