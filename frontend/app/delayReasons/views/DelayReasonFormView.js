// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/delayReasons/templates/form'
], function(
  _,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    serializeForm: function(formData)
    {
      formData.drm = _.defaults({}, formData.drm, {
        man: '',
        machine: '',
        method: '',
        material: ''
      });

      return formData;
    }

  });
});
