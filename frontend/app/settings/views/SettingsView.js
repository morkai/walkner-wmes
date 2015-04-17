// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/core/View',
  'app/core/templates/colorPicker',
  'bootstrap-colorpicker'
], function(
  js2form,
  View,
  colorPickerTemplate
) {
  'use strict';

  return View.extend({

    clientUrl: '#settings',
    defaultTab: 'default',
    updateSettingField: function(setting)
    {
      /*jshint unused:false*/
    },

    events: {
      'click a[data-tab]': function(e)
      {
        var tab = e.target.dataset.tab;

        this.broker.publish('router.navigate', {
          url: this.clientUrl + '?tab=' + tab,
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
      'change .form-control, input[type="checkbox"], input[type="radio"]': function(e)
      {
        this.scheduleUpdateSetting(e.target, 300);
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
      var $colorPickers = this.$('.colorpicker-component');

      if ($colorPickers.length)
      {
        $colorPickers.colorpicker('destroy');
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        renderColorPicker: colorPickerTemplate
      };
    },

    afterRender: function()
    {
      this.$('.colorpicker-component').colorpicker();

      var view = this;
      var formData = {};

      this.settings.forEach(function(setting)
      {
        var value = setting.get('value');

        if (Array.isArray(value))
        {
          var el = view.el.querySelector('input[name="' + setting.id + '"]');

          if (el.tagName !== 'SELECT' && el.type !== 'checkbox')
          {
            value = String(value);
          }
        }
        else
        {
          value = String(value);
        }

        formData[setting.id] = value;
      });

      js2form(this.el, formData);

      this.$('[name]').each(function()
      {
        this.dataset.value = this.value;
      });

      this.changeTab(this.currentTab || this.defaultTab);
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

      var $formControl = this.$('.form-control[name="' + setting.id + '"]');

      if ($formControl.length)
      {
        $formControl.val(setting.get('value') || '');
      }

      var $parent = $formControl.parent();

      if ($parent.hasClass('colorpicker-component'))
      {
        $parent.colorpicker('setValue', setting.get('value'));
      }

      if ($formControl.length)
      {
        return;
      }

      var $inputs = this.$('input[name="' + setting.id + '"]');

      if ($inputs.length)
      {
        if ($inputs[0].type === 'checkbox')
        {
          this.updateCheckboxSetting(setting, $inputs);

          return;
        }
        else if ($inputs[0].type === 'radio')
        {
          this.updateRadioSetting(setting, $inputs);

          return;
        }
      }

      this.updateSettingField(setting);
    },

    updateCheckboxSetting: function(setting, $checkboxes)
    {
      var value = setting.get('value');

      if ($checkboxes.length === 1)
      {
        $checkboxes[0].checked = !!value;
      }
      else
      {
        if (!Array.isArray(value))
        {
          value = value ? [value] : [];
        }

        for (var i = 0; i < $checkboxes.length; ++i)
        {
          var checkboxEl = $checkboxes[0];

          checkboxEl.checked = value.indexOf(checkboxEl.value) !== -1;
        }
      }
    },

    updateRadioSetting: function(setting, $radios)
    {
      $radios.val(setting.get('value'));
    },

    getValueFromSettingField: function(el)
    {
      if (el.type === 'checkbox')
      {
        return this.getValueFromCheckboxSetting(el);
      }

      if (el.type === 'radio')
      {
        return this.getValueFromRadioSetting(el);
      }

      return el.value;
    },

    getValueFromCheckboxSetting: function(el)
    {
      var $checkboxes = this.$('input[name="' + el.name + '"]');

      if ($checkboxes.length === 0)
      {
        return null;
      }

      if ($checkboxes.length === 1)
      {
        return this.getCheckboxValue($checkboxes[0]);
      }

      var values = [];

      for (var i = 0; i < $checkboxes.length; ++i)
      {
        var value = this.getCheckboxValue($checkboxes[i]);

        if (value)
        {
          values.push(value);
        }
      }

      return values;
    },

    getCheckboxValue: function(checkboxEl)
    {
      if (checkboxEl.value === 'true')
      {
        return checkboxEl.checked;
      }

      if (checkboxEl.value === '1')
      {
        return checkboxEl.checked ? 1 : 0;
      }

      return checkboxEl.checked ? checkboxEl.value : null;
    },

    getValueFromRadioSetting: function(el)
    {
      return this.$('input[name="' + el.name + '"]:checked').val();
    },

    scheduleUpdateSetting: function(el, delay)
    {
      var settingId = el.name;
      var settingValue = this.getValueFromSettingField(el);

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
