// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-locations/templates/form'
], function(
  FormView,
  idAndLabel,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      formData.buildings = (formData.buildings || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.buildings = (formData.buildings || '').split(',').map(v => +v).filter(v => v > 0);

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpBuildingsSelect2();
    },

    setUpBuildingsSelect2: function()
    {
      this.$id('buildings').select2({
        multiple: true,
        data: dictionaries.buildings.map(building =>
        {
          return {
            id: building.id,
            text: building.getLabel({long: true})
          };
        })
      });
    }

  });
});
