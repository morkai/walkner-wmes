// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/wmes-compRel-reasons/templates/form'
], function(
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template

  });
});
