// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/FormView',
  'app/feedback/templates/form'
], function(
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: {
      'submit': 'submitForm',
      'blur textarea': function(e)
      {
        e.currentTarget.value = e.currentTarget.value.trim();
      }
    },

    serializeForm: function(formData)
    {
      formData.createdAt = new Date();

      return formData;
    },

    destroy: function()
    {
      FormView.prototype.destroy.call(this);

      if (typeof this.options.done === 'function')
      {
        this.options.done(false);
      }
    }

  });
});
