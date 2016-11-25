// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  './SnCheckerView',
  'app/production/templates/taktTime'
], function(
  _,
  t,
  viewport,
  View,
  SnCheckerView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click #-check': function()
      {
        viewport.showDialog(
          new SnCheckerView({model: this.model}),
          t('production', 'taktTime:check:title')
        );
      }
    }

  });
});
