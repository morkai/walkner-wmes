// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/settings/views/SettingsView',
  'app/orders/templates/settings'
], function(
  _,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#orders;settings',

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

      this.setUpMrps('documents-excludedMrps', 'orders.documents.excludedMrps');
      this.setUpMrps('iptChecker-mrps', 'orders.iptChecker.mrps');
    },

    setUpMrps: function(elId, settingId)
    {
      this.$id(elId).select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        data: [],
        formatNoMatches: null,
        minimumResultsForSearch: 1,
        dropdownCssClass: 'hidden',
        tokenizer: function(input, selection, selectCallback)
        {
          var result = input;
          var options = {};

          selection.forEach(function(item)
          {
            options[item.id] = true;
          });

          (input.match(/[A-Z0-9]{3}/ig) || []).forEach(function(mrp)
          {
            result = result.replace(mrp, '');

            mrp = mrp.toUpperCase();

            if (!options[mrp])
            {
              selectCallback({id: mrp, text: mrp});
              options[mrp] = true;
            }
          });

          return input === result ? null : result.replace(/\s+/, ' ').trim();
        }
      });

      this.updateSettingField(this.settings.get(settingId));
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return !/mrps$/i.test(setting.id);
    },

    updateSettingField: function(setting)
    {
      if (setting && /mrps$/i.test(setting.id))
      {
        var data = setting.getValue().map(function(mrp)
        {
          return {id: mrp, text: mrp};
        });

        this.$id(setting.id.replace('orders.', '').replace('.', '-')).select2('data', data);
      }
    }

  });
});
