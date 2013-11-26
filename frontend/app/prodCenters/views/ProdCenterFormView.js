define([
  'underscore',
  'app/core/views/FormView',
  'app/prodCenters/templates/form',
  'i18n!app/nls/prodCenters'
], function(
  _,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'prodCenterForm',

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
