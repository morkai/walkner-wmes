// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/settings/views/SettingsView',
  'app/orders/templates/settings'
], function(
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#orders;settings',

    template: template

  });
});
