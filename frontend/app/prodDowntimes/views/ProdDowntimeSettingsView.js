// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/core/View',
  'app/prodDowntimes/templates/settings'
], function(
  js2form,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click a[data-tab]': function(e)
      {
        var tab = e.target.dataset.tab;

        this.broker.publish('router.navigate', {
          url: '#prodDowntimes;settings?tab=' + tab,
          trigger: false,
          replace: true
        });

        this.changeTab(tab);

        return false;
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
      }
    },

    initialize: function()
    {
      this.currentTab = this.options.initialTab;
      this.inProgress = {};

      this.listenTo(this.settings, 'add change', this.onSettingsChange);
    },

    afterRender: function()
    {
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

      this.changeTab(this.currentTab || 'default');
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

      this.$('.form-control[name="' + setting.id + '"]').val(setting.get('value') || '');
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
