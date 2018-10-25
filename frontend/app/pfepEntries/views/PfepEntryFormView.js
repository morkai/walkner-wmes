// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/pfepEntries/templates/form'
], function(
  _,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.assign({

      'blur #-packType': function(e)
      {
        if (/^[A-Z]+$/i.test(e.target.value))
        {
          var v = e.target.value.toLowerCase();

          e.target.value = v.substring(0, 1).toUpperCase() + v.substring(1);
        }
      }

    }, FormView.prototype.events)

  });
});
