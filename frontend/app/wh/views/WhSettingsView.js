// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/settings/views/SettingsView',
  'app/wh/templates/settings'
], function(
  _,
  setUpMrpSelect2,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#wh/settings',

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

      setUpMrpSelect2(this.$id('planning-ignoredMrps'), {
        width: '100%',
        placeholder: ' ',
        sortable: true,
        own: false,
        view: this
      });
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return setting.id !== 'wh.planning.ignoredMrps';
    },

    updateSettingField: function(setting)
    {
      if (setting && setting.id === 'wh.planning.ignoredMrps')
      {
        this.$id('planning-ignoredMrps').select2('data', setting.getValue().map(function(mrp)
        {
          return {id: mrp, text: mrp};
        }));
      }
    }

  });
});
