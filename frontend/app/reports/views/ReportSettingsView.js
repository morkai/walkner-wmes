// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/data/orgUnits',
  'app/settings/views/SettingsView',
  'app/reports/templates/settings'
], function(
  _,
  orgUnits,
  SettingsView,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#reports;settings',
    defaultTab: 'efficiency',

    template: template,

    localTopics: {
      'divisions.synced': 'render',
      'subdivisions.synced': 'render'
    },

    events: _.extend({
      'change [name$="prodTask"]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      },
      'change [name$="id"]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      }
    }, SettingsView.prototype.events),

    serialize: function()
    {
      return _.extend(SettingsView.prototype.serialize.call(this), {
        divisions: this.serializeProdDivisions(),
        colors: this.serializeColors()
      });
    },

    serializeProdDivisions: function()
    {
      return orgUnits.getAllDivisions()
        .filter(function(division)
        {
          return division.get('type') === 'prod';
        })
        .map(function(division)
        {
          return {
            _id: division.id,
            label: division.getLabel(),
            subdivisions: orgUnits.getChildren(division)
              .map(function(subdivision)
              {
                return {
                  _id: subdivision.id,
                  label: subdivision.getLabel()
                };
              })
              .sort(function(a, b)
              {
                return a.label.localeCompare(b.label);
              })
          };
        })
        .sort(function(a, b)
        {
          return a.label.localeCompare(b.label);
        });
    },

    serializeStorageSubdivisions: function()
    {
      return orgUnits.getAllByType('subdivision')
        .filter(function(subdivision)
        {
          return subdivision.get('type') === 'storage';
        })
        .map(function(subdivision)
        {
          return {
            id: subdivision.id,
            text: subdivision.get('division') + ' \\ ' + subdivision.get('name')
          };
        })
        .sort(function(a, b)
        {
          return a.text.localeCompare(b.text);
        });
    },

    serializeColors: function()
    {
      var colors = {};

      [
        'quantityDone',
        'efficiency',
        'productivity', 'productivityNoWh',
        'scheduledDowntime', 'unscheduledDowntime',
        'clipOrderCount', 'clipProduction', 'clipEndToEnd',
        'direct', 'directRef',
        'indirect', 'indirectRef',
        'warehouse', 'warehouseRef',
        'absence', 'absenceRef',
        'dirIndir', 'dirIndirRef',
        'eff', 'ineff',
        'hrTotal'
      ].forEach(function(metric)
      {
        colors[metric] = this.settings.getColor(metric);
      }, this);

      return colors;
    },

    afterRender: function()
    {
      SettingsView.prototype.afterRender.call(this);

      var storageSubdivisions = this.serializeStorageSubdivisions();

      this.$id('wh-comp-id').select2({
        width: '374px',
        allowClear: true,
        placeholder: ' ',
        data: storageSubdivisions
      });

      this.$id('wh-finGoods-id').select2({
        width: '374px',
        allowClear: true,
        placeholder: ' ',
        data: storageSubdivisions
      });

      this.$('input[name$="prodTask"]').select2({
        width: '374px',
        allowClear: true,
        placeholder: ' ',
        data: this.prodTasks.serializeToSelect2()
      });
    },

    updateSettingField: function(setting)
    {
      var $el = this.$('input[name="' + setting.id + '"]');

      if ($el.hasClass('select2-offscreen'))
      {
        return $el.select2('val', setting.getValue());
      }
    }

  });
});
