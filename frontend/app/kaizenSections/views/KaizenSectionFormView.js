// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/kaizenSections/templates/form'
], function(
  FormView,
  idAndLabel,
  orgUnits,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.subdivisions = Array.isArray(formData.subdivisions) ? formData.subdivisions.join(',') : '';

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.subdivisions = formData.subdivisions ? formData.subdivisions.split(',') : [];

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
    }

  });
});
