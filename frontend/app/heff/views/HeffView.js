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
  'app/heff/templates/page'
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
  template
) {
  'use strict';

  var HOUR_TO_INDEX = [
    2, 3, 4, 5, 6, 7, 0, 1,
    2, 3, 4, 5, 6, 7, 0, 1,
    2, 3, 4, 5, 6, 7, 0, 1
  ];

  return View.extend({

    template: template,

    remoteTopics: function()
    {
      var topics = {};

      if (this.model.prodLineId)
      {
        topics['heff.reload.' + this.model.prodLineId] = 'onReload';
      }

      return topics;
    },

    localTopics: {
      'socket.connected': 'loadData'
    },

    events: {
      'click #-line': function()
      {
        var $line = this.$id('line');

        if ($line.find('select').length)
        {
          return;
        }

        $line.html('<i class="fa fa-spinner fa-spin"></i>');

        this.ajax({url: '/prodLines?select(_id)&deactivatedAt=null'}).done(function(res)
        {
          var options = '';

          _.forEach(res.collection, function(line)
          {
            options += '<option>' + _.escape(line._id) + '</option>';
          });

          var $select = $('<select></select>').html(options);

          $line.empty().append($select);

          $select.val(localStorage.getItem('HEFF:LINE')).on('change', function()
          {
            localStorage.setItem('HEFF:LINE', $select.val());

            window.location.reload();
          });
        });
      },

      'click #-snMessage': 'hideSnMessage'
    },

    initialize: function()
    {
      this.periodicUpdate = this.periodicUpdate.bind(this);
      this.loadData = this.loadData.bind(this);
      this.currentHour = -1;
      this.shiftStartInfo = null;

      snManager.bind(this);
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      this.updateLine();
      this.periodicUpdate();
      this.loadData();

      embedded.render(this);
      embedded.ready();
    },

    loadData: function()
    {
      var view = this;

      if (!view.model.prodLineId)
      {
        return;
      }

      var url = '/heff/' + encodeURIComponent(view.model.prodLineId);

      clearTimeout(view.timers.loadData);

      view.ajax({url: url}).done(function(quantitiesDone)
      {
        view.updateData(quantitiesDone);

        view.timers.loadData = setTimeout(view.loadData, 5 * 60 * 1000);
      });
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

      var shift = t('core', 'SHIFT:' + this.shiftStartInfo.no);

      this.$id('shift').html(t('heff', 'shift', {shift: shift}));
    },

    updateLine: function()
    {
      this.$id('line').html(this.model.prodLineId || '?');
    },

    updateTitle: function(moment)
    {
      this.$id('title').html(t('heff', 'title', {
        from: this.shiftStartInfo.moment.format('H:00'),
        to: moment.clone().add(1, 'hours').format('H:00')
      }));
    },

    updateData: function(quantitiesDone)
    {
      var currentTime = time.getMoment();
      var currentHour = currentTime.hours();
      var currentHourIndex = HOUR_TO_INDEX[currentHour];
      var currentMinute = currentTime.minutes();
      var currentPlanned = 0;
      var endOfHourPlanned = 0;
      var totalPlanned = 0;
      var totalActual = 0;

      for (var hourIndex = 0; hourIndex < 8; ++hourIndex)
      {
        var hourPlanned = quantitiesDone[hourIndex].planned;
        var hourActual = quantitiesDone[hourIndex].actual;

        totalPlanned += hourPlanned;
        totalActual += hourActual;

        if (hourIndex < currentHourIndex)
        {
          currentPlanned += hourPlanned;
          endOfHourPlanned += hourPlanned;
        }
        else if (hourIndex === currentHourIndex)
        {
          endOfHourPlanned += hourPlanned;
          currentPlanned += Math.round(hourPlanned * (currentMinute / 60) * 1000) / 1000;
        }
      }

      this.$id('planned').text(endOfHourPlanned);
      this.$id('actual').text(totalActual);
      this.$id('remaining').text(Math.max(totalPlanned - totalActual, 0));

      this.$id('eff')
        .removeClass('fa-smile-o fa-frown-o fa-meh-o')
        .addClass(totalActual >= currentPlanned ? 'fa-smile-o' : 'fa-frown-o');
    },

    onReload: function(message)
    {
      this.updateData(message.quantitiesDone);
    }

  });
});
