// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/CoordinatorsFormView',
  'app/wmes-osh-locations/templates/form'
], function(
  FormView,
  idAndLabel,
  dictionaries,
  CoordinatorsFormView,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.coordinatorsView = new CoordinatorsFormView({
        model: this.model
      });

      this.setView('#-coordinators', this.coordinatorsView);
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      formData.buildings = (formData.buildings || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.buildings = (formData.buildings || '').split(',').map(v => +v).filter(v => v > 0);
      formData.coordinators = this.coordinatorsView.serializeForm();

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
