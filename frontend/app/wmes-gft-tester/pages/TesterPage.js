// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/data/localStorage',
  'app/core/View',
  'app/core/util/getShiftStartInfo',
  'app/core/util/embedded',
  'app/production/views/VkbView',
  'app/wmes-gft-tester/views/UnlockDialogView',
  'app/wmes-gft-tester/views/OrderView',
  'app/wmes-gft-tester/views/ConfigView',
  'app/wmes-gft-tester/views/PcbView',
  'app/wmes-gft-tester/views/TesterView',
  'app/wmes-gft-tester/templates/page'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  localStorage,
  View,
  getShiftStartInfo,
  embedded,
  VkbView,
  UnlockDialogView,
  OrderView,
  ConfigView,
  PcbView,
  TesterView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    remoteTopics: function()
    {
      const topics = {};
      const line = this.model.get('line');
      const station = this.model.get('station') || 0;

      if (line)
      {
        topics[`gft.stations.updated.${line}.${station}`] = 'onStateUpdated';
      }

      return topics;
    },

    localTopics: {
      'socket.connected': function()
      {
        this.loadData();
      }
    },

    events: {
      'click #-line': function()
      {
        if (window.WMES_CLIENT)
        {
          if (embedded.isEnabled())
          {
            embedded.actions.config();
          }

          return false;
        }

        var dialogView = new UnlockDialogView({
          model: this.model
        });

        viewport.showDialog(dialogView, this.t('unlockDialog:title'));

        return false;
      }
    },

    initialize: function()
    {
      this.periodicUpdate = this.periodicUpdate.bind(this);

      this.shiftStartInfo = null;
      this.currentHour = -1;

      this.defineViews();
      this.defineBindings();

      this.setView('#-order', this.orderView);
      this.setView('#-config', this.configView);
      this.setView('#-pcb', this.pcbView);
      this.setView('#-tester', this.testerView);
      this.setView('#-vkb', this.vkbView);
    },

    defineViews: function()
    {
      this.vkbView = new VkbView();
      this.orderView = new OrderView({model: this.model, vkb: this.vkbView});
      this.configView = new ConfigView({model: this.model});
      this.pcbView = new PcbView({model: this.model});
      this.testerView = new TesterView({model: this.model});
    },

    defineBindings: function()
    {
      this.listenTo(this.model, 'sync', this.onModelSynced);

      this.once('afterRender', function()
      {
        this.loadData();
      });
    },

    afterRender: function()
    {
      this.periodicUpdate();
      this.updateLine();

      embedded.render(this);
      embedded.ready();

      if (!this.model.get('line'))
      {
        this.$id('line').click();
      }
    },

    periodicUpdate: function()
    {
      var moment = time.getMoment();
      var hour = moment.hours();

      this.updateDate(moment);

      if (hour !== this.currentHour)
      {
        this.currentHour = hour;

        this.hourlyUpdate(moment);
      }

      clearTimeout(this.timers.periodicUpdate);
      this.timers.periodicUpdate = setTimeout(this.periodicUpdate, 1000);
    },

    hourlyUpdate: function(moment)
    {
      this.updateShift(moment);
    },

    updateDate: function(moment)
    {
      this.$id('date').html(moment.format('dddd, LL<br>LTS'));
    },

    updateShift: function(moment)
    {
      this.shiftStartInfo = getShiftStartInfo(moment.valueOf());

      var shift = this.t('core', 'SHIFT:' + this.shiftStartInfo.no);

      this.$id('shift').html(this.t('shift', {shift: shift}));
    },

    updateLine: function()
    {
      var line = '?';

      if (this.model.get('line'))
      {
        line = this.model.get('line');

        if (this.model.get('station'))
        {
          line = this.t('station', {
            line: line,
            station: this.model.get('station')
          });
        }
      }

      this.$id('line').text(line);
    },

    loadData: function()
    {
      if (this.model.get('line'))
      {
        this.model.fetch();
      }
    },

    onModelSynced: function()
    {

    },

    onStateUpdated: function(message)
    {
      this.model.update(message);
    }

  });
});
