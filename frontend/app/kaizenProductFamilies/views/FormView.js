// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/kaizenCategories/views/CoordSectionsFormView',
  'app/kaizenProductFamilies/templates/form'
], function(
  FormView,
  setUpMrpSelect2,
  CoordSectionsFormView,
  template
) {
  'use strict';

  return FormView.extend({

    template,

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.coordSectionsView = new CoordSectionsFormView({
        model: this.model
      });

      this.setView('#-coordSections', this.coordSectionsView);
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('_id').prop('readonly', true);
        this.$id('name').focus();
      }

      setUpMrpSelect2(this.$id('mrps'), {
        width: '100%'
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.mrps = (formData.mrps || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.mrps = (formData.mrps || '').split(',').filter(function(v) { return !!v.length; });

      this.coordSectionsView.serializeForm(formData);

      return formData;
    }

  });
});
