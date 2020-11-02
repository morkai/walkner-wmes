// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-eventCategories/templates/form'
], function(
  FormView,
  dictionaries,
  template
) {
  'use strict';

  return FormView.extend({

    template,

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

      this.$id('activityKind').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.activityKinds.map(kind => ({
          id: kind.id,
          text: kind.getLabel({long: true})
        }))
      });
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

      if (!formData.activityKind)
      {
        formData.activityKind = 0;
      }

      return formData;
    }

  });
});
