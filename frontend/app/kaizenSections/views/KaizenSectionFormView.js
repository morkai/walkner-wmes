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
      formData.confirmers = '';
      formData.coordinators = '';

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.subdivisions = formData.subdivisions ? formData.subdivisions.split(',') : [];
      formData.confirmers = setUpUserSelect2.getUserInfo(this.$id('confirmers')) || [];
      formData.coordinators = setUpUserSelect2.getUserInfo(this.$id('coordinators')) || [];

      return formData;
    },

    afterRender: function()
    {
      var view = this;

      FormView.prototype.afterRender.call(view);

      if (view.options.editMode)
      {
        view.$id('id').prop('readonly', true);
        view.$id('name').focus();
      }

      view.$id('subdivisions').select2({
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

      ['confirmers', 'coordinators'].forEach(function(prop)
      {
        var $users = setUpUserSelect2(view.$id(prop), {
          multiple: true,
          noPersonnelId: true
        });

        $users.select2('data', (view.model.get(prop) || []).map(function(u)
        {
          return {
            id: u.id,
            text: u.label
          };
        }));
      });
    }

  });
});
