// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/settings/views/SettingsView',
  'app/wmes-toolcal-tools/templates/settings'
], function(
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#toolcal/settings',

    template: template

  });
});
