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

      this.setUpEventCategoriesSelect2();
    },

    setUpEventCategoriesSelect2: function()
    {
      const data = {};

      dictionaries.eventCategories.forEach(eventCategory =>
      {
        if (!eventCategory.get('active'))
        {
          return;
        }

        data[eventCategory.id] = {
          id: eventCategory.id,
          text: eventCategory.getLabel({long: true})
        };
      });

      (this.model.get('eventCategories') || []).forEach(id =>
      {
        if (data[id])
        {
          return;
        }

        const eventCategory = dictionaries.eventCategories.get(id);

        if (eventCategory)
        {
          data[eventCategory.id] = {
            id: eventCategory.id,
            text: eventCategory.getLabel({long: true})
          };
        }
        else
        {
          data[id] = {
            id: id,
            text: `?${id}?`
          };
        }
      });

      this.$id('eventCategories').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        placeholder: ' ',
        data: Object.values(data).sort((a, b) => a.text.localeCompare(b))
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
