// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/idAndLabel',
  'app/settings/views/SettingsView',
  '../dictionaries',
  'app/qiResults/templates/settings'
], function(
  _,
  idAndLabel,
  SettingsView,
  dictionaries,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#qi/settings',

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

      this.setUpDefaultErrorCategories();
      this.setUpOqlKinds();
    },

    setUpDefaultErrorCategories: function()
    {
      this.$id('defaultErrorCategory').select2({
        width: '100%',
        allowClear: true,
        data: dictionaries.errorCategories.map(idAndLabel)
      });

      this.updateSettingField(this.settings.get('qi.defaultErrorCategory'));
    },

    setUpOqlKinds: function()
    {
      this.$id('oqlKinds').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        data: dictionaries.kinds.map(idAndLabel)
      });

      this.updateSettingField(this.settings.get('qi.oqlKinds'));
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      var $setting = this.$('[data-setting="' + setting.id + '"]');

      return !$setting.length || $setting[0].dataset.setting === undefined;
    },

    updateSettingField: function(setting)
    {
      if (!setting)
      {
        return;
      }

      if (setting.id === 'qi.oqlKinds')
      {
        this.$id('oqlKinds').select2('data', setting.getValue().map(function(id)
        {
          var kind = dictionaries.kinds.get(id);

          return {
            id: id,
            text: kind ? kind.getLabel() : id
          };
        }));
      }

      if (setting.id === 'qi.defaultErrorCategory')
      {
        var id = setting.getValue();
        var errorCategory = dictionaries.errorCategories.get(setting.getValue());

        this.$id('defaultErrorCategory').select2('data', {
          id: id,
          text: errorCategory ? errorCategory.getLabel() : id
        });
      }
    }

  });
});
