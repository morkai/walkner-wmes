// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/prodFunctions',
  'app/core/util/idAndLabel',
  'app/settings/views/SettingsView',
  'app/wmes-fap-entries/templates/settings'
], function(
  _,
  prodFunctions,
  idAndLabel,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#fap/settings',

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

      this.setUpPendingFunctions();
    },

    setUpPendingFunctions: function()
    {
      this.$id('pendingFunctions').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });

      this.$id('categoryFunctions').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });

      this.updateSettingField(this.settings.get('fap.pendingFunctions'));
      this.updateSettingField(this.settings.get('fap.categoryFunctions'));
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return !/Functions$/i.test(setting.id);
    },

    updateSettingField: function(setting)
    {
      if (!setting)
      {
        return;
      }

      if (/Functions$/i.test(setting.id))
      {
        var data = setting.getValue().map(function(f)
        {
          var prodFunction = prodFunctions.get(f);

          return {
            id: f,
            text: prodFunction ? prodFunction.getLabel() : f
          };
        });

        this.$id(setting.id.split('.')[1]).select2('data', data);
      }
    }

  });
});
