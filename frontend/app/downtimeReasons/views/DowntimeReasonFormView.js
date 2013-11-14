define([
  'app/core/views/FormView',
  'app/downtimeReasons/templates/form',
  'i18n!app/nls/downtimeReasons'
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
