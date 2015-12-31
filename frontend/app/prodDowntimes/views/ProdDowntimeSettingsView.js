// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/settings/views/SettingsView',
  'app/prodDowntimes/templates/settings'
], function(
  _,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#prodDowntimes;settings',

    template: template

  });
});
