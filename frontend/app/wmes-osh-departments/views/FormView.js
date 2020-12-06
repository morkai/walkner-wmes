// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-departments/templates/form'
], function(
  FormView,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpWorkplaceSelect2();
      this.setUpManagerSelect2();
      this.setUpCoordinatorsSelect2();
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

    setUpManagerSelect2: function()
    {
      setUpUserSelect2(this.$id('manager'), {
        currentUserInfo: this.model.get('manager')
      });
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
      formData.manager = setUpUserSelect2.getUserInfo(this.$id('manager'));
      formData.coordinators = setUpUserSelect2.getUserInfo(this.$id('coordinators'));

      if (!formData.syncPatterns)
      {
        formData.syncPatterns = '';
      }

      return formData;
    }

  });
});