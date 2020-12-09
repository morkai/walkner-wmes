// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/idAndLabel',
  'app/data/prodFunctions',
  'app/settings/views/SettingsView',
  'app/kaizenOrders/templates/settings'
], function(
  _,
  idAndLabel,
  prodFunctions,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({
    nlsDomain: 'kaizenOrders',

    clientUrl: '#kaizenOrders;settings',

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

      this.$id('superiorFuncs').select2({
        width: '100%',
        multiple: true,
        allowClear: true,
        data: prodFunctions.map(idAndLabel)
      });
    }

  });
});
