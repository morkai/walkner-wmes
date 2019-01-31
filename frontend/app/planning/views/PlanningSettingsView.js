// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/settings/views/SettingsView',
  'app/planning/templates/settings'
], function(
  _,
  setUpMrpSelect2,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#planning/settings',

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

      setUpMrpSelect2(this.$id('wh-ignoredMrps'), {
        width: '100%',
        placeholder: ' ',
        sortable: true,
        own: false,
        view: this
      });

      setUpMrpSelect2(this.$id('wh-newIncludedMrps'), {
        width: '100%',
        placeholder: ' ',
        sortable: true,
        own: false,
        view: this
      });
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return setting.id !== 'planning.wh.ignoredMrps' && setting.id !== 'planning.wh.newIncludedMrps';
    },

    updateSettingField: function(setting)
    {
      if (setting && /edMrps/.test(setting.id))
      {
        this.$id(setting.id.replace('planning.wh.', 'wh-')).select2('data', setting.getValue().map(function(mrp)
        {
          return {id: mrp, text: mrp};
        }));
      }
    }

  });
});
