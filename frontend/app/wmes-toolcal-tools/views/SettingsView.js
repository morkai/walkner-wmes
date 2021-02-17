// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/settings/views/SettingsView',
  'app/users/util/setUpUserSelect2',
  'app/wmes-toolcal-tools/templates/settings'
], function(
  SettingsView,
  setUpUserSelect2,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#toolcal/settings',

    template: template,

    events: Object.assign({
      'change #-notifier-globalUsers': function(e)
      {
        this.updateSetting(e.target.name, setUpUserSelect2.getUserInfo(this.$(e.target)));
      }
    }, SettingsView.prototype.events),

    afterRender: function()
    {
      SettingsView.prototype.afterRender.apply(this, arguments);

      setUpUserSelect2(this.$id('notifier-globalUsers'), {
        width: '100%',
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        currentUserInfo: this.settings.getValue('notifier.globalUsers', [])
      });
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return !/globalUsers$/.test(setting.id);
    },

    updateSettingField: function(setting)
    {
      if (setting && /globalUsers$/.test(setting.id))
      {
        var data = setting.getValue().map(function(userInfo)
        {
          return {id: userInfo.id, text: userInfo.label};
        });

        this.$('input[name="' + setting.id + '"]').select2('data', data);
      }
    }

  });
});
