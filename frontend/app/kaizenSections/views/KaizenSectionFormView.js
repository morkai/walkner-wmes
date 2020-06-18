// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/users/util/setUpUserSelect2',
  'app/kaizenSections/templates/form'
], function(
  FormView,
  idAndLabel,
  orgUnits,
  setUpUserSelect2,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.subdivisions = Array.isArray(formData.subdivisions) ? formData.subdivisions.join(',') : '';
      formData.coordinators = '';

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.subdivisions = formData.subdivisions ? formData.subdivisions.split(',') : [];
      formData.coordinators = setUpUserSelect2.getUserInfo(this.$id('coordinators')) || [];

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('id').prop('readonly', true);
        this.$id('name').focus();
      }

      this.$id('subdivisions').select2({
        allowClear: true,
        multiple: true,
        data: orgUnits.getAllByType('subdivision').map(function(s)
        {
          return {
            id: s.id,
            text: s.get('division') + ' \\ ' + s.get('name')
          };
        })
      });

      var $coordinators = setUpUserSelect2(this.$id('coordinators'), {
        multiple: true,
        noPersonnelId: true
      });

      $coordinators.select2('data', (this.model.get('coordinators') || []).map(function(u)
      {
        return {
          id: u.id,
          text: u.label
        };
      }));
    }

  });
});
