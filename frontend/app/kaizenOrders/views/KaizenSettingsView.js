// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/settings/views/SettingsView',
  'app/kaizenOrders/templates/settings'
], function(
  _,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#kaizenOrders;settings',

    template: template,

    events: _.assign({
      'change input[data-setting]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      }
    }, SettingsView.prototype.events)

  });
});
