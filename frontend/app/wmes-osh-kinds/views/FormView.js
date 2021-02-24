// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/CoordinatorsFormView',
  'app/wmes-osh-kinds/templates/form'
], function(
  FormView,
  setUpUserSelect2,
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
        kinds: false,
        model: this.model
      });

      this.setView('#-coordinators', this.coordinatorsView);
    },

    getTemplateData: function()
    {
      return {
        types: dictionaries.kindTypes,
        entryTypes: dictionaries.entryTypes.filter(t => t !== 'observation')
      };
    },

    serializeForm: function(formData)
    {
      if (!formData.description)
      {
        formData.description = '';
      }

      if (!formData.entryTypes)
      {
        formData.entryTypes = [];
      }

      formData.coordinators = this.coordinatorsView.serializeForm();

      return formData;
    }

  });
});
