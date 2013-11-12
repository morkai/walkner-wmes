define([
  'app/core/views/FormView',
  'app/workCenters/templates/form',
  'i18n!app/nls/workCenters'
], function(
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'workCenter',

    successUrlPrefix: '/workCenters/',

    afterRender: function()
    {
      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
        this.$('.form-control[name=description]').focus();
      }
    },

  });
});
