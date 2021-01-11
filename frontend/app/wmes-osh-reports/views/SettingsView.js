// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/settings/views/SettingsView',
  'app/wmes-osh-reports/templates/settings'
], function(
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    template,

    nlsDomain: 'wmes-osh-reports',

    clientUrl: '#osh/reports;settings'

  });
});
