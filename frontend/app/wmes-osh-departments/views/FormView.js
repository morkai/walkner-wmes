// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/views/CoordinatorsFormView',
  'app/wmes-osh-departments/templates/form'
], function(
  FormView,
  idAndLabel,
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
        model: this.model
      });

      this.setView('#-coordinators', this.coordinatorsView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpWorkplaceSelect2();
    },

    setUpWorkplaceSelect2: function()
    {
      this.$id('workplace').select2({
        width: '100%',
        data: dictionaries.workplaces.map(workplace => ({
          id: workplace.id,
          text: workplace.getLabel({long: true})
        }))
      });
    },

    serializeForm: function(formData)
    {
      formData.coordinators = this.coordinatorsView.serializeForm();

      if (!formData.syncPatterns)
      {
        formData.syncPatterns = '';
      }

      return formData;
    }

  });
});
