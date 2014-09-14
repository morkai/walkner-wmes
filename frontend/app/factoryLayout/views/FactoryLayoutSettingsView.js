// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/core/View',
  'app/data/orgUnits',
  'app/core/templates/colorPicker',
  'app/factoryLayout/templates/settings',
  'bootstrap-colorpicker'
], function(
  js2form,
  View,
  orgUnits,
  colorPickerTemplate,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    localTopics: {
      'divisions.synced': 'render',
      'subdivisions.synced': 'render'
    },

    events: {
      'click a[data-tab]': function(e)
      {
        var tab = e.target.dataset.tab;

        this.broker.publish('router.navigate', {
          url: '#factoryLayout;settings?tab=' + tab,
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
      'change input[name^="factoryLayout.blacklist"]': function(e)
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
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
      this.$('.colorpicker-component').colorpicker('destroy');
    },

    serialize: function()
    {
      var settings = this.settings;

      return {
        idPrefix: this.idPrefix,
        renderColorPicker: colorPickerTemplate,
        divisions: orgUnits.getAllByType('division').map(function(division)
        {
          var property = 'factoryLayout.' + division.id + '.color';
          var setting = settings.get(property);

          return {
            property: property,
            label: division.getLabel(),
            color: setting ? setting.get('value') : '#FFFFFF'
          };
        })
      };
    },

    afterRender: function()
    {
      this.$('.colorpicker-component').colorpicker();

      var formData = {};

      this.settings.forEach(function(setting)
      {
        formData[setting.id] = String(setting.get('value'));
      });

      js2form(this.el, formData);

      this.$('[name]').each(function()
      {
        this.dataset.value = this.value;
      });

      this.setUpBlacklistSelect2('division');
      this.setUpBlacklistSelect2('subdivision');
      this.setUpBlacklistSelect2('mrpController');
      this.setUpBlacklistSelect2('prodFlow');
      this.setUpBlacklistSelect2('workCenter');
      this.setUpBlacklistSelect2('prodLine');

      this.changeTab(this.currentTab || 'blacklist');
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

      if (/blacklist/.test(setting.id))
      {
        return this.$('input[name="' + setting.id + '"]').select2('val', setting.getValue());
      }

      var $el = this.$('.form-control[name="' + setting.id + '"]');

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
