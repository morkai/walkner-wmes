// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/settings/views/SettingsView',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/paintShop/templates/loadStatusRow',
  'app/paintShop/templates/settings'
], function(
  _,
  $,
  idAndLabel,
  orgUnits,
  SettingsView,
  setUpMrpSelect2,
  loadStatusRowTemplate,
  template
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#paintShop;settings',

    template: template,

    events: _.assign({
      'change input[data-setting]': function(e)
      {
        this.updateSetting(e.target.name, e.target.value);
      },
      'change select[data-property="icon"]': function(e)
      {
        var $row = this.$(e.target).closest('tr');
        var icon = 'fa-' + e.target.value;

        $row.find('.fa[data-bg]').removeClass().addClass('fa ' + icon);

        this.scheduleLoadStatusesSave();
      },
      'change input[data-property="color"]': function(e)
      {
        this.$(e.target).closest('tr').find('.fa[data-bg]').css('color', e.target.value);

        this.scheduleLoadStatusesSave();
      },
      'change input[data-property="from"]': 'scheduleLoadStatusesSave',
      'change input[data-property="to"]': 'scheduleLoadStatusesSave',
      'click #-load-addStatus': function()
      {
        this.addLoadStatus({
          from: 999,
          to: 9999,
          icon: 'question',
          color: '#00AAFF'
        });

        this.scheduleLoadStatusesSave();
      },
      'click .btn[data-status-action="remove"]': function(e)
      {
        var $row = this.$(e.currentTarget).closest('tr');

        $row.fadeOut('fast', function()
        {
          $row.find('.colorpicker-component').colorpicker('destroy');
          $row.remove();
        });

        this.scheduleLoadStatusesSave();
      },
      'change #-load-counter': function()
      {
        if (this.timers.saveLoadStatuses)
        {
          this.saveLoadStatuses();
        }

        this.setUpLoadStatuses();
      }
    }, SettingsView.prototype.events),

    destroy: function()
    {
      if (this.timers.saveLoadStatuses)
      {
        clearTimeout(this.timers.saveLoadStatuses);
        this.saveLoadStatuses();
      }

      SettingsView.prototype.destroy.apply(this, arguments);
    },

    afterRender: function()
    {
      SettingsView.prototype.afterRender.apply(this, arguments);

      this.setUpWorkCenters();
      this.setUpMspPaints();
      this.setUpLoadStatuses();
    },

    setUpWorkCenters: function()
    {
      this.$id('planning-workCenters').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        data: orgUnits.getAllByType('workCenter')
          .filter(function(wc) { return !wc.get('deactivatedAt'); })
          .map(idAndLabel)
      });

      this.updateSettingField(this.settings.get('paintShop.workCenters'));
    },

    setUpMspPaints: function()
    {
      this.$id('planning-mspPaints').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        data: this.paints.map(idAndLabel)
      });

      this.updateSettingField(this.settings.get('paintShop.mspPaints'));
    },

    setUpLoadStatuses: function()
    {
      this.$id('load-statuses').find('.colorpicker-component').each((i, el) => $(el).colorpicker('destroy'));
      this.$id('load-statuses').empty();

      const counter = this.getLoadCounter();

      this.$id('load-addStatus').prop('disabled', !counter);
      this.$id('load-delayedDuration')
          .prop('disabled', !counter)
          .prop('name', `paintShop.load.delayedDuration.${counter}`)
          .val(this.settings.getValue(`load.delayedDuration.${counter}`, 0));

      this.settings.getValue(`load.statuses.${counter}`, []).forEach(this.addLoadStatus, this);
    },

    addLoadStatus: function(status)
    {
      const $row = this.renderPartial(loadStatusRowTemplate, {
        status
      });

      this.$id('load-statuses').append($row);

      $row.find('.colorpicker-component').colorpicker();
    },

    scheduleLoadStatusesSave: function()
    {
      clearTimeout(this.timers.saveLoadStatuses);

      this.lastLoadStatuses = this.serializeLoadStatuses();
      this.lastLoadCounter = this.getLoadCounter();
      this.timers.saveLoadStatuses = setTimeout(this.saveLoadStatuses.bind(this), 1337);
    },

    serializeLoadStatuses: function()
    {
      var view = this;

      if (!view.el.parentNode)
      {
        return null;
      }

      var statuses = [];

      view.$id('load-statuses').find('tr').each(function()
      {
        var color = this.querySelector('[data-property="color"]').value;

        statuses.push({
          from: Math.max(0, parseInt(this.querySelector('[data-property="from"]').value, 10) || 0),
          to: Math.max(0, parseInt(this.querySelector('[data-property="to"]').value, 10) || 0),
          icon: this.querySelector('[data-property="icon"]').value,
          color: /^#[A-Fa-f0-9]{6}$/.test(color) ? color : '#00AAFF'
        });
      });

      return statuses;
    },

    saveLoadStatuses: function()
    {
      clearTimeout(this.timers.saveLoadStatuses);
      this.timers.saveLoadStatuses = null;

      let counter = this.getLoadCounter();
      let value = this.serializeLoadStatuses();

      if (!value)
      {
        counter = this.lastLoadCounter;
        value = this.lastLoadStatuses;
      }

      this.lastLoadCounter = 0;
      this.lastLoadStatuses = null;

      if (!counter || !value)
      {
        return;
      }

      this.updateSetting(`paintShop.load.statuses.${counter}`, value);
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return setting.id !== 'paintShop.workCenters'
        && setting.id !== 'paintShop.mspPaints'
        && !setting.id.startsWith('paintShop.load.statuses');
    },

    updateSettingField: function(setting)
    {
      if (!setting)
      {
        return;
      }

      if (setting.id === 'paintShop.workCenters')
      {
        return this.$id('planning-workCenters').select2('data', setting.getValue().map(id => ({id, text: id})));
      }

      if (setting.id.startsWith('paintShop.load.statuses'))
      {
        return this.setUpLoadStatuses();
      }
    },

    getLoadCounter: function()
    {
      return +this.$id('load-counter').val() || 0;
    }

  });
});
