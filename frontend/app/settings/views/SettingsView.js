// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'app/viewport',
  'app/user',
  'app/core/View',
  'app/core/templates/colorPicker',
  '../SettingChangeCollection',
  './ChangesView',
  'bootstrap-colorpicker'
], function(
  _,
  js2form,
  viewport,
  currentUser,
  View,
  colorPickerTemplate,
  SettingChangeCollection,
  ChangesView
) {
  'use strict';

  return View.extend({

    clientUrl: '#settings',
    defaultTab: null,
    shouldAutoUpdateSettingField: function(setting) // eslint-disable-line no-unused-vars
    {
      return true;
    },
    updateSettingField: function(setting) // eslint-disable-line no-unused-vars
    {

    },

    events: {
      'click a[data-tab]': function(e)
      {
        var el = e.currentTarget;
        var tab = el.dataset.tab;
        var subtab = el.dataset.subtab || '';

        if (el.dataset.redirect)
        {
          window.location.href = el.dataset.redirect;
        }
        else if (!el.classList.contains('disabled'))
        {
          this.broker.publish('router.navigate', {
            url: this.clientUrl + '?tab=' + tab + '&subtab=' + subtab,
            trigger: false,
            replace: true
          });

          this.changeTab(tab, subtab);
        }

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
          this.scheduleUpdateSetting(el, parseInt(el.dataset.keyupDelay, 10) || 1200);
        }
      },
      'change .form-control, input[type="checkbox"], input[type="radio"]': function(e)
      {
        var delay = parseInt(e.target.dataset.changeDelay, 10);

        if (isNaN(delay) || delay < 0)
        {
          delay = 300;
        }

        this.scheduleUpdateSetting(e.target, delay);
      },
      'click label': function(e)
      {
        if (!e.ctrlKey || !currentUser.isAllowedTo('SUPER'))
        {
          return;
        }

        var el = e.currentTarget;
        var id = el.dataset.setting || (e.currentTarget.control && e.currentTarget.control.name);

        if (id)
        {
          this.showSettingChanges(id);

          return false;
        }
      }
    },

    initialize: function()
    {
      this.currentTab = this.options.initialTab;
      this.currentSubtab = this.options.initialSubtab;
      this.inProgress = {};
      this.model = this.settings;

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
      return Object.assign(View.prototype.serialize.call(this), {
        renderColorPicker: colorPickerTemplate
      });
    },

    afterRender: function()
    {
      this.toggleTabPrivileges();

      this.$('.colorpicker-component').colorpicker();

      js2form(this.el, this.serializeFormData());

      this.$('[name]').each(function()
      {
        this.dataset.value = this.value;
      });

      this.changeTab(
        this.currentTab || this.defaultTab || this.$('.list-group-item[data-tab]').attr('data-tab'),
        this.currentSubtab
      );
    },

    toggleTabPrivileges: function() {},

    serializeFormData: function()
    {
      var formData = {};
      var view = this;

      this.settings.forEach(function(setting)
      {
        var value = view.settings.prepareFormValue(setting.id, setting.get('value'));

        if (Array.isArray(value))
        {
          var el = view.el.querySelector('input[name="' + setting.id + '"]')
            || view.el.querySelector('input[name="' + setting.id + '[]"]');

          if (!el || (el.tagName !== 'SELECT' && el.type !== 'checkbox'))
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

      return formData;
    },

    changeTab: function(tab, subtab)
    {
      var $oldTab = this.$('.list-group-item.active');
      var $newTab = this.$('.list-group-item[data-tab="' + tab + '"]').first();

      if ($newTab.hasClass('disabled'))
      {
        if ($oldTab.length)
        {
          return;
        }

        this.$('.list-group-item').filter(':not(.disabled)').first().click();

        return;
      }

      $oldTab.removeClass('active');
      $newTab.addClass('active');
      this.$('.panel-body.active').removeClass('active');

      var $newTabPanel = this.$('.panel-body[data-tab="' + tab + '"]').addClass('active');

      if ($newTabPanel.hasClass('has-subtabs'))
      {
        if (_.isEmpty(subtab))
        {
          subtab = $newTabPanel.find('.list-group-item').first().attr('data-subtab');
        }

        $oldTab = $newTabPanel.find('.list-group-item.active');
        $newTab = $newTabPanel.find('.list-group-item[data-subtab="' + subtab + '"]');

        if ($newTab.hasClass('disabled'))
        {
          if ($oldTab.length)
          {
            return;
          }

          $newTabPanel.find('.list-group-item').filter(':not(.disabled)').first().click();

          return;
        }

        $oldTab.removeClass('active');
        $newTab.addClass('active');
        $newTabPanel.find('.panel-body.active').removeClass('active');
        $newTabPanel.find('.panel-body[data-subtab="' + subtab + '"]').addClass('active');
      }

      this.currentTab = tab;
      this.currentSubtab = subtab;
    },

    onSettingsChange: function(setting)
    {
      if (!setting || this.inProgress[setting.id])
      {
        return;
      }

      if (!this.shouldAutoUpdateSettingField(setting))
      {
        this.updateSettingField(setting);

        return;
      }

      var $formControl = this.$('.form-control[name="' + setting.id + '"]');
      var value = this.settings.prepareFormValue(setting.id, setting.get('value'));

      if ($formControl.length)
      {
        $formControl.val(value);
      }

      var $parent = $formControl.parent();

      if ($parent.hasClass('colorpicker-component'))
      {
        $parent.colorpicker('setValue', value);
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

        var $prev = $inputs.first().prev();

        if ($prev.hasClass('select2-container'))
        {
          if ($prev.hasClass('select2-container-multi') && !Array.isArray(value))
          {
            value = value.split(',');
          }

          $prev.select2('val', value);
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
          if (!value)
          {
            value = [];
          }
          else if (typeof value === 'string')
          {
            value = value.split(',');
          }
          else
          {
            value = [value];
          }
        }

        for (var i = 0; i < $checkboxes.length; ++i)
        {
          var checkboxEl = $checkboxes[i];

          checkboxEl.checked = value.indexOf(checkboxEl.value) !== -1;
        }
      }
    },

    updateRadioSetting: function(setting, $radios)
    {
      $radios.filter('[value="' + setting.get('value') + '"]').prop('checked', true);
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
      var settingId = el.name.replace('[]', '');

      if (_.isEmpty(settingId))
      {
        return;
      }

      var settingValue = this.getValueFromSettingField(el);

      if (this.timers[settingId])
      {
        clearTimeout(this.timers[settingId]);
      }

      if (delay === 0)
      {
        delete this.timers[settingId];

        this.updateSetting(settingId, settingValue);

        return;
      }

      this.timers[settingId] = setTimeout(this.updateSetting.bind(this, settingId, settingValue), delay);
    },

    updateSetting: function(settingId, settingValue)
    {
      var view = this;

      clearTimeout(view.timers[settingId]);

      if (!view.inProgress[settingId])
      {
        view.inProgress[settingId] = 0;
      }

      ++view.inProgress[settingId];

      viewport.msg.saving();

      view.settings.update(settingId, settingValue).always(function()
      {
        --view.inProgress[settingId];

        viewport.msg.saved();
      });
    },

    showSettingChanges: function(id)
    {
      id = id.replace('[]', '');

      var dialogView = new ChangesView({
        collection: new SettingChangeCollection(null, {
          rqlQuery: 'limit(20)&sort(-time)&setting=' + encodeURIComponent(id)
        })
      });

      viewport.showDialog(dialogView, id);
    }

  });
});
