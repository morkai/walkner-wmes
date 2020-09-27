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
  'app/production/snManager',
  'app/heff/views/UnlockDialogView',
  'app/heff/views/HourlyEfficiencyView',
  'app/heff/views/ShiftEfficiencyView',
  'app/heff/templates/page',
  'highcharts/themes/high-contrast-dark'
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
  snManager,
  UnlockDialogView,
  HourlyEfficiencyView,
  ShiftEfficiencyView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    remoteTopics: function()
    {
      var topics = {};

      if (this.model.get('prodLine'))
      {
        topics['heff.updated.' + this.model.get('prodLine')] = 'onStateUpdated';
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
      'click': function(e)
      {
        if (!$(e.target).closest('.embedded-actions').length)
        {
          this.swapView();
        }
      },
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
      },

      'click #-snMessage': 'hideSnMessage'
    },

    initialize: function()
    {
      this.periodicUpdate = this.periodicUpdate.bind(this);

      this.shiftStartInfo = null;
      this.currentHour = -1;
      this.currentView = null;

      this.defineViews();
      this.defineBindings();

      this.setView('#-hourlyEfficiency', this.hourlyEfficiencyView);
      this.setView('#-shiftEfficiency', this.shiftEfficiencyView);

      snManager.bind(this);
    },

    defineViews: function()
    {
      this.hourlyEfficiencyView = new HourlyEfficiencyView({model: this.model});
      this.shiftEfficiencyView = new ShiftEfficiencyView({model: this.model});
    },

    defineBindings: function()
    {
      this.listenTo(this.model, 'sync', this.onModelSynced);

      this.once('afterRender', function()
      {
        this.swapView();
        this.loadData();
      });
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      this.periodicUpdate();
      this.updateLine();

      embedded.render(this);
      embedded.ready();

      if (!this.model.get('prodLine'))
      {
        this.$id('line').click();
      }
    },

    swapView: function()
    {
      if (this.currentView === this.hourlyEfficiencyView)
      {
        this.currentView = this.shiftEfficiencyView;

        this.$id('hourlyEfficiency').addClass('hidden');
        this.$id('shiftEfficiency').removeClass('hidden');

        this.hourlyEfficiencyView.deactivate();
      }
      else if (this.currentView === this.shiftEfficiencyView)
      {
        this.currentView = this.hourlyEfficiencyView;

        this.$id('shiftEfficiency').addClass('hidden');
        this.$id('hourlyEfficiency').removeClass('hidden');

        this.shiftEfficiencyView.deactivate();
      }
      else
      {
        this.currentView = this.hourlyEfficiencyView;
      }

      this.updateTitle(time.getMoment());
      this.currentView.activate();

      clearTimeout(this.timers.swapView);
      this.timers.swapView = setTimeout(this.swapView.bind(this), this.currentView.swapDelay);
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

      if (this.currentView)
      {
        this.currentView.periodicUpdate();
      }

      clearTimeout(this.timers.periodicUpdate);
      this.timers.periodicUpdate = setTimeout(this.periodicUpdate, 1000);
    },

    hourlyUpdate: function(moment)
    {
      this.updateShift(moment);
      this.updateTitle(moment);
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

      if (this.model.get('prodLine'))
      {
        line = this.model.get('prodLine');

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

    updateTitle: function(now)
    {
      if (this.currentView)
      {
        this.$id('title').html(this.currentView.getTitle(this.shiftStartInfo, now));
      }
    },

    loadData: function()
    {
      if (this.model.get('prodLine'))
      {
        this.model.fetch();
      }
    },

    onModelSynced: function()
    {
      clearTimeout(this.timers.reload);
      this.timers.reload = setTimeout(this.loadData.bind(this), 15 * 60 * 1000);
    },

    onStateUpdated: function(message)
    {
      this.model.update(message);
    }

  });
});
