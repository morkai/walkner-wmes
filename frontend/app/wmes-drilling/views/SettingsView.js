// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/settings/views/SettingsView',
  'app/wmes-drilling/templates/settings'
], function(
  _,
  $,
  idAndLabel,
  orgUnits,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#drilling;settings',

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

      this.setUpWorkCenters();
    },

    setUpWorkCenters: function()
    {
      this.$id('planning-workCenters').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        data: orgUnits.getAllByType('workCenter')
          .filter(function(wc) { return !wc.get('deactivatedAt'); })
          .map(idAndLabel)
      });

      this.updateSettingField(this.settings.get('drilling.workCenters'));
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return setting.id !== 'drilling.workCenters';
    },

    updateSettingField: function(setting)
    {
      if (!setting)
      {
        return;
      }

      if (setting.id === 'drilling.workCenters')
      {
        return this.$id('planning-workCenters').select2('data', setting.getValue().map(function(v)
        {
          return {
            id: v,
            text: v
          };
        }));
      }
    }

  });
});
