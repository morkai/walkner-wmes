// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/settings/views/SettingsView',
  'app/wmes-compRel-entries/templates/settings'
], function(
  _,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#compRel/settings',

    template: template,

    events: _.assign({
      'change input[data-setting]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      }
    }, SettingsView.prototype.events),

    afterRender: function()
    {
      SettingsView.prototype.afterRender.apply(this, arguments);
    },

    setUpPendingFunctions: function()
    {

    },

    shouldAutoUpdateSettingField: function(setting) // eslint-disable-line no-unused-vars
    {
      return true;
    },

    updateSettingField: function(setting)
    {
      if (!setting)
      {
        return;
      }
    }

  });
});
