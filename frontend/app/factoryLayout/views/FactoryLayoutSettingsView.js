// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/data/orgUnits',
  'app/settings/views/SettingsView',
  'app/factoryLayout/templates/settings'
], function(
  _,
  orgUnits,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#factoryLayout;settings',
    defaultTab: 'blacklist',

    template: template,

    localTopics: {
      'divisions.synced': 'render',
      'subdivisions.synced': 'render'
    },

    events: _.extend({
      'change input[name^="factoryLayout.blacklist"]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      }
    }, SettingsView.prototype.events),

    serialize: function()
    {
      var settings = this.settings;

      return _.extend(SettingsView.prototype.serialize.call(this), {
        divisions: _.map(orgUnits.getAllByType('division'), function(division)
        {
          var property = 'factoryLayout.' + division.id + '.color';
          var setting = settings.get(property);

          return {
            property: property,
            label: division.getLabel(),
            color: setting ? setting.get('value') : '#FFFFFF'
          };
        })
      });
    },

    afterRender: function()
    {
      SettingsView.prototype.afterRender.call(this);

      this.setUpBlacklistSelect2('division');
      this.setUpBlacklistSelect2('subdivision');
      this.setUpBlacklistSelect2('mrpController');
      this.setUpBlacklistSelect2('prodFlow');
      this.setUpBlacklistSelect2('workCenter');
      this.setUpBlacklistSelect2('prodLine');
    },

    setUpBlacklistSelect2: function(type)
    {
      var $input = this.$id('blacklist-' + type);

      $input.select2({
        multiple: true,
        data: orgUnits.getAllByType(type).map(function(orgUnit)
        {
          return {
            id: orgUnit.id,
            text: (type === 'subdivision' ? (orgUnit.get('division') + ' > ') : '') + orgUnit.getLabel()
          };
        })
      });
    },

    updateSettingField: function(setting)
    {
      if (/blacklist/.test(setting.id))
      {
        return this.$('input[name="' + setting.id + '"]').select2('val', setting.getValue());
      }
    }

  });
});
