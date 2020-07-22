// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-dummyPaint-paints/templates/massUpdate'
], function(
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    request: function(formData)
    {
      return this.ajax({
        method: 'POST',
        url: '/dummyPaint/paints;massUpdate',
        data: JSON.stringify(formData)
      });
    }

  });
});
