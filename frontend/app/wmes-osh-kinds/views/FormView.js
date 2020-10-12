// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-kinds/templates/form'
], function(
  FormView,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    getTemplateData: function()
    {
      return {
        types: dictionaries.kindTypes
      };
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpCoordinatorsSelect2();
    },

    setUpCoordinatorsSelect2: function()
    {
      setUpUserSelect2(this.$id('coordinators'), {
        multiple: true,
        allowClear: true,
        currentUserInfo: this.model.get('coordinators')
      });
    },

    serializeForm: function(formData)
    {
      if (!formData.description)
      {
        formData.description = '';
      }

      formData.coordinators = setUpUserSelect2.getUserInfo(this.$id('coordinators'));

      return formData;
    }

  });
});
