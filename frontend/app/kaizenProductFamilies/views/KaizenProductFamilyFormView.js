// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/kaizenProductFamilies/templates/form'
], function(
  _,
  FormView,
  setUpUserSelect2,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.owners = (formData.owners || []).map(function(o) { return o.id; }).join(',');
      formData.mrps = (formData.mrps || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.owners = (this.$id('owners').select2('data') || []).map(function(o)
      {
        return {
          id: o.id,
          label: o.text
        };
      });

      formData.mrps = (formData.mrps || '').split(',').filter(function(v) { return !!v.length; });

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('_id').prop('readonly', true);
        this.$id('name').focus();
      }

      setUpUserSelect2(this.$id('owners'), {
        view: this,
        multiple: true
      });

      setUpMrpSelect2(this.$id('mrps'), {
        width: '100%'
      });
    }

  });
});
