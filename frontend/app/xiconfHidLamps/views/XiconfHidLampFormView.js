// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/xiconfHidLamps/templates/form'
], function(
  _,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'blur #-_id': function(e)
      {
        e.target.value = e.target.value.replace(/^0+/, '');
      }

    }, FormView.prototype.events)

  });
});
