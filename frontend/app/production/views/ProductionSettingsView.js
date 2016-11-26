// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/idAndLabel',
  'app/data/downtimeReasons',
  'app/data/orgUnits',
  'app/settings/views/SettingsView',
  'app/production/templates/settings'
], function(
  _,
  idAndLabel,
  downtimeReasons,
  orgUnits,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#production;settings',

    template: template,

    events: _.extend({
      'change input[data-setting]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      }
    }, SettingsView.prototype.events),

    afterRender: function()
    {
      SettingsView.prototype.afterRender.apply(this, arguments);

      var downtimes = downtimeReasons.map(idAndLabel);
      var activeLines = orgUnits.getAllByType('prodLine')
        .filter(function(d) { return !d.get('deactivatedAt'); })
        .map(idAndLabel);

      this.$id('rearmDowntimeReason').select2({
        allowClear: true,
        placeholder: ' ',
        data: downtimes
      });

      this.$id('spigotLines').select2({
        allowClear: true,
        placeholder: ' ',
        multiple: true,
        data: activeLines
      });

      this.$id('taktTime-lines').select2({
        allowClear: true,
        placeholder: ' ',
        multiple: true,
        data: activeLines
      });

      this.$id('taktTime-ignoredDowntimes').select2({
        allowClear: true,
        placeholder: ' ',
        multiple: true,
        data: downtimes
      });
    }

  });
});
