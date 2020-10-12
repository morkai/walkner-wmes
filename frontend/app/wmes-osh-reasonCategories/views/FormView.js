// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-reasonCategories/templates/form'
], function(
  FormView,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('eventCategories').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        placeholder: ' ',
        data: dictionaries.eventCategories.map(eventCategory => ({
          id: eventCategory.id,
          text: eventCategory.getLabel({long: true})
        }))
      });
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      formData.eventCategories = (formData.eventCategories || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.eventCategories = (formData.eventCategories || '').split(',').map(v => +v).filter(v => v > 0);

      if (!formData.description)
      {
        formData.description = '';
      }

      return formData;
    }

  });
});
