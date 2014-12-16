// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/core/View',
  'app/data/orgUnits',
  'app/core/templates/colorPicker',
  'app/reports/templates/settings',
  'bootstrap-colorpicker'
], function(
  js2form,
  View,
  orgUnits,
  colorPickerTemplate,
  settingsTemplate
) {
  'use strict';

  return View.extend({

    template: settingsTemplate,

    localTopics: {
      'divisions.synced': 'render',
      'subdivisions.synced': 'render'
    },

    events: {
      'click a[data-tab]': function(e)
      {
        var tab = e.target.dataset.tab;

        this.broker.publish('router.navigate', {
          url: '#reports;settings?tab=' + tab,
          trigger: false,
          replace: true
        });

        this.changeTab(tab);

        return false;
      },
      'change .colorpicker-component > .form-control': function(e)
      {
        if (e.originalEvent)
        {
          this.$(e.target).closest('.colorpicker-component').colorpicker('setValue', e.target.value);
        }
      },
      'keyup .form-control': function(e)
      {
        var el = e.target;
        var lastValue = el.dataset.value;

        el.dataset.value = el.value;

        if (el.value !== lastValue)
        {
          this.scheduleUpdateSetting(el, 1200);
        }
      },
      'change .form-control': function(e)
      {
        this.scheduleUpdateSetting(e.target, 300);
      },
      'change [name$="prodTask"]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      },
      'change [name$="id"]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      }
    },

    initialize: function()
    {
      this.currentTab = this.options.initialTab;
      this.inProgress = {};

      this.listenTo(this.settings, 'add change', this.onSettingsChange);
    },

    destroy: function()
    {
      this.$('.colorpicker-component').colorpicker('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        renderColorPicker: colorPickerTemplate,
        divisions: this.serializeProdDivisions(),
        colors: this.serializeColors()
      };
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
      this.$('.colorpicker-component').colorpicker();

      var formData = {};

      this.settings.forEach(function(setting)
      {
        formData[setting.id] = setting.get('value');
      });

      js2form(this.el, formData);

      this.$('[name]').each(function()
      {
        this.dataset.value = this.value;
      });

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

      this.changeTab(this.currentTab || 'efficiency');
    },

    changeTab: function(tab)
    {
      this.$('.list-group-item.active').removeClass('active');
      this.$('.list-group-item[data-tab=' + tab + ']').addClass('active');
      this.$('.panel-body.active').removeClass('active');
      this.$('.panel-body[data-tab=' + tab + ']').addClass('active');

      this.currentTab = tab;
    },

    onSettingsChange: function(setting)
    {
      if (!setting || this.inProgress[setting.id])
      {
        return;
      }

      var $el = this.$('[name="' + setting.id + '"]');

      if (!$el.length)
      {
        return;
      }

      if ($el.hasClass('select2-offscreen'))
      {
        return $el.select2('val', setting.getValue());
      }

      $el.val(setting.get('value') || '');

      var $parent = $el.parent();

      if ($parent.hasClass('colorpicker-component'))
      {
        $parent.colorpicker('setValue', setting.get('value'));
      }
    },

    scheduleUpdateSetting: function(el, delay)
    {
      var settingId = el.name;
      var settingValue = el.value;

      if (this.timers[settingId])
      {
        clearTimeout(this.timers[settingId]);
      }

      this.timers[settingId] = setTimeout(this.updateSetting.bind(this, settingId, settingValue), delay);
    },

    updateSetting: function(settingId, settingValue)
    {
      clearTimeout(this.timers[settingId]);

      if (!this.inProgress[settingId])
      {
        this.inProgress[settingId] = 0;
      }

      ++this.inProgress[settingId];

      var view = this;

      this.promised(this.settings.update(settingId, settingValue)).always(function()
      {
        --view.inProgress[settingId];

        view.onSettingsChange(view.settings.get(settingId));
      });
    }

  });
});
