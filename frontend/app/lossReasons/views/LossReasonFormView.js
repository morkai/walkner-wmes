define([
  'app/core/views/FormView',
  'app/lossReasons/templates/form',
  'i18n!app/nls/lossReasons'
], function(
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
        this.$('.form-control[name=label]').focus();
      }
    }

  });
});
