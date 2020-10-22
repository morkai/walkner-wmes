// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-stations/templates/form'
], function(
  FormView,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    serializeToForm: function()
    {
      return this.model.toJSON();
    },

    serializeForm: function(formData)
    {
      formData.location = +formData.location;

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpLocationSelect2();
    },

    setUpLocationSelect2: function()
    {
      this.$id('location').select2({
        data: dictionaries.locations.map(location =>
        {
          return {
            id: location.id,
            text: location.getLabel({long: true}),
            model: location
          };
        })
      });
    }

  });
});
