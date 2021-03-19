// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/prodFunctions',
  'app/core/util/idAndLabel',
  'app/settings/views/SettingsView',
  'app/users/util/setUpUserSelect2',
  'app/wmes-fap-entries/templates/settings'
], function(
  _,
  prodFunctions,
  idAndLabel,
  SettingsView,
  setUpUserSelect2,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#fap/settings',

    template: template,

    events: _.assign({
      'change input[data-setting]': function(e)
      {
        this.updateSetting(e.target.name, this.getValueFromSettingField(e.target));
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

      setUpUserSelect2(this.$id('quickUsers'), {
        view: this,
        multiple: true
      });

      this.updateSettingField(this.settings.get('fap.pendingFunctions'));
      this.updateSettingField(this.settings.get('fap.categoryFunctions'));
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return !/(Functions|quickUsers)$/i.test(setting.id);
    },

    updateSettingField: function(setting)
    {
      if (!setting)
      {
        return;
      }

      if (/Functions$/i.test(setting.id))
      {
        this.$id(setting.id.split('.')[1]).select2('data', (setting.getValue() || []).map(function(f)
        {
          var prodFunction = prodFunctions.get(f);

          return {
            id: f,
            text: prodFunction ? prodFunction.getLabel() : f
          };
        }));
      }

      if (/quickUsers$/.test(setting.id))
      {
        this.$id('quickUsers').select2('data', (setting.getValue() || []).map(function(u)
        {
          return {
            id: u.id,
            text: u.label
          };
        }));
      }
    },

    getValueFromSettingField: function(el)
    {
      if (/quickUsers$/.test(el.name))
      {
        return setUpUserSelect2.getUserInfo(this.$id('quickUsers'));
      }

      return SettingsView.prototype.getValueFromSettingField.apply(this, arguments);
    }

  });
});
