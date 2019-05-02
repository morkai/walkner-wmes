// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/idAndLabel',
  'app/core/views/FormView',
  'app/wmes-fap-entries/dictionaries',
  'app/wmes-fap-subCategories/templates/form'
], function(
  idAndLabel,
  FormView,
  dictionaries,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('parent').select2({
        data: dictionaries.categories.map(idAndLabel)
      });
    }

  });
});
