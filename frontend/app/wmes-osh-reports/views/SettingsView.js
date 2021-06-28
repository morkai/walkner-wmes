// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/users/util/setUpUserSelect2',
  'app/settings/views/SettingsView',
  'app/wmes-osh-reports/templates/settings'
], function(
  setUpUserSelect2,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    template,

    nlsDomain: 'wmes-osh-reports',

    clientUrl: '#osh/reports;settings',

    events: Object.assign({

      'change #-rewards-ignoredUsers': function()
      {
        const ignoredUsers = setUpUserSelect2.getUserInfo(this.$id('rewards-ignoredUsers'));

        this.updateSetting('osh.rewards.ignoredUsers', ignoredUsers);
      }

    }, SettingsView.prototype.events),

    afterRender: function()
    {
      SettingsView.prototype.afterRender.apply(this, arguments);

      this.setUpIgnoredUsers();
    },

    setUpIgnoredUsers: function()
    {
      const $ignoredUsers = setUpUserSelect2(this.$id('rewards-ignoredUsers'), {
        view: this,
        multiple: true
      });


    },

    shouldAutoUpdateSettingField: function(setting)
    {
      if (/ignoredUsers$/.test(setting.id))
      {
        return false;
      }

      return true;
    },

    updateSettingField: function(setting)
    {
      this.$id('rewards-ignoredUsers').select2('data', setting.getValue().map(u =>({
        id: u.id,
        text: u.label
      })));
    }

  });
});
