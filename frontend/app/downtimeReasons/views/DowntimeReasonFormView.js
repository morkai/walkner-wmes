// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/FormView',
  'app/downtimeReasons/templates/form'
], function(
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
        this.$('.form-control[name=label]').focus();
      }
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.scheduled = String(formData.scheduled);

      return formData;
    },

    serializeForm: function(formData)
    {
      if (formData.scheduled === 'null')
      {
        formData.scheduled = null;
      }

      return formData;
    }

  });
});
