// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'js2form',
  'app/core/View',
  'app/data/orgUnits',
  'app/core/templates/colorPicker',
  'app/reports/templates/settings',
  'bootstrap-colorpicker'
], function(
  _,
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
        this.scheduleUpdateSetting(e.target, 600);
      },
      'change .form-control': function(e)
      {
        this.scheduleUpdateSetting(e.target, 300);

      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('v');
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
        divisions: orgUnits.getAllDivisions()
          .filter(function(division) { return division.get('type') === 'prod'; })
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
                .sort(function(a, b) { return a.label.localeCompare(b.label); })
            };
          })
          .sort(function(a, b) { return a.label.localeCompare(b.label); }),
        colors: this.serializeColors()
      };
    },

    serializeColors: function()
    {
      var colors = {};

      [
        'quantityDone',
        'efficiency',
        'productivity',
        'productivityNoWh',
        'scheduledDowntime',
        'unscheduledDowntime'
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

      this.changeTab(this.currentTab || 'efficiency');
    },

    changeTab: function(tab)
    {
      this.$('.nav-tabs > .active').removeClass('active');
      this.$('.nav-tabs [data-tab=' + tab + ']').parent().addClass('active');
      this.$('.panel.active').removeClass('active');
      this.$('.panel[data-tab=' + tab + ']').addClass('active');

      this.currentTab = tab;
    },

    onSettingsChange: function(setting)
    {
      if (!this.inProgress[setting.id])
      {
        var $el = this.$('.form-control[name="' + setting.id + '"]');

        $el.val(setting.get('value') || '');

        var $parent = $el.parent();

        if ($parent.hasClass('colorpicker-component'))
        {
          $parent.colorpicker('setValue', setting.get('value'));
        }
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
