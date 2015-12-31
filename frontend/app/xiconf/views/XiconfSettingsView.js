// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/settings/views/SettingsView',
  'app/xiconf/templates/settings'
], function(
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#xiconf;settings',

    template: template

  });
});
