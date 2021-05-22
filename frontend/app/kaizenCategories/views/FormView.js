// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  './CoordSectionsFormView',
  'app/kaizenCategories/templates/form'
], function(
  FormView,
  CoordSectionsFormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

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
    },

    serializeForm: function(formData)
    {
      if (!formData.description)
      {
        formData.description = '';
      }

      formData.inNearMiss = !!formData.inNearMiss;
      formData.inSuggestion = !!formData.inSuggestion;

      this.coordSectionsView.serializeForm(formData);

      return formData;
    }

  });
});
