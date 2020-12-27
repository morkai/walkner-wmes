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

      formData.departments = (formData.departments || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.departments = (formData.departments || '').split(',').map(v => +v).filter(v => v > 0);

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpDepartmentsSelect2();
    },

    setUpDepartmentsSelect2: function()
    {
      this.$id('departments').select2({
        multiple: true,
        data: dictionaries.workplaces.map(workplace =>
        {
          return {
            text: workplace.getLabel({long: true}),
            children: workplace.getDepartments().map(department =>
            {
              return {
                id: department.id,
                text: department.getLabel({long: true}),
                department
              };
            })
          };
        }),
        formatSelection: (item, $el, e) =>
        {
          return e(item.department.getLabel({path: true}));
        }
      });
    }

  });
});
