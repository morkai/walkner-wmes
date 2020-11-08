// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-activityKinds/templates/form'
], function(
  FormView,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    events: Object.assign({

      'change input[name="rootCauses"]': 'toggleResolution',
      'change input[name="implementers"]': 'toggleResolution'

    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('kinds').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        placeholder: ' ',
        data: dictionaries.kinds.map(kind => ({
          id: kind.id,
          text: kind.getLabel({long: true})
        }))
      });

      this.toggleResolution();
    },

    serializeToForm: function()
    {
      const formData = this.model.toJSON();

      formData.kinds = (formData.kinds || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.kinds = (formData.kinds || '').split(',').map(v => +v).filter(v => v > 0);

      if (!formData.description)
      {
        formData.description = '';
      }

      formData.implementers = !!formData.implementers;

      if (!formData.allowedTypes)
      {
        formData.allowedTypes = [];
      }

      return formData;
    },

    toggleResolution: function()
    {
      const rootCauses = this.$('input[name="rootCauses"]').prop('checked');
      const $implementers = this.$('input[name="implementers"]');

      $implementers.prop('disabled', rootCauses);

      if (rootCauses)
      {
        $implementers.prop('checked', false);
      }
    }

  });
});
