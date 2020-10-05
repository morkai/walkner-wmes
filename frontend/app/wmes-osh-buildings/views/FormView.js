// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-buildings/templates/form'
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

      formData.divisions = (formData.divisions || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.divisions = formData.divisions.split(',').map(v => +v).filter(v => v > 0);

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpDivisionsSelect2();
    },

    setUpDivisionsSelect2: function()
    {
      this.$id('divisions').select2({
        multiple: true,
        data: dictionaries.workplaces.map(workplace =>
        {
          return {
            text: workplace.getLabel({long: true}),
            children: workplace.getDivisions().map(division =>
            {
              return {
                id: division.id,
                text: division.getLabel({long: true}),
                division
              };
            })
          };
        }),
        formatSelection: (item, $el, e) =>
        {
          return e(item.division.getLabel({path: true}));
        }
      });
    }

  });
});
