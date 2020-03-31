// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/settings/views/SettingsView',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/wmes-ct-state/templates/settings'
], function(
  _,
  SettingsView,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#ct/settings',

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

      setUpMrpSelect2(this.$id('ignoredMrps'), {
        width: '100%',
        placeholder: ' ',
        sortable: false,
        own: false,
        view: this
      });

      setUpMrpSelect2(this.$id('includedMrps'), {
        width: '100%',
        placeholder: ' ',
        sortable: false,
        own: false,
        view: this
      });
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return !/Mrps$/.test(setting.id);
    },

    updateSettingField: function(setting)
    {
      if (setting && /Mrps$/.test(setting.id))
      {
        this.$id(setting.id.split('.').pop()).select2('data', setting.getValue().map(function(mrp)
        {
          return {id: mrp, text: mrp};
        }));
      }
    }

  });
});
