// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/data/localStorage',
  'app/core/View',
  'app/core/util/getShiftStartInfo',
  'app/heff/templates/page'
], function(
  _,
  $,
  t,
  time,
  localStorage,
  View,
  getShiftStartInfo,
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
        topics['heff.reload.' + this.model.prodLineId] = 'loadData';
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

      'mousedown #-switchApps': function(e) { this.startActionTimer('switchApps', e); },
      'touchstart #-switchApps': function() { this.startActionTimer('switchApps'); },
      'mouseup #-switchApps': function() { this.stopActionTimer('switchApps'); },
      'touchend #-switchApps': function() { this.stopActionTimer('switchApps'); },

      'mousedown #-reboot': function(e) { this.startActionTimer('reboot', e); },
      'touchstart #-reboot': function() { this.startActionTimer('reboot'); },
      'mouseup #-reboot': function() { this.stopActionTimer('reboot'); },
      'touchend #-reboot': function() { this.stopActionTimer('reboot'); },

      'mousedown #-shutdown': function(e) { this.startActionTimer('shutdown', e); },
      'touchstart #-shutdown': function() { this.startActionTimer('shutdown'); },
      'mouseup #-shutdown': function() { this.stopActionTimer('shutdown'); },
      'touchend #-shutdown': function() { this.stopActionTimer('shutdown'); }
    },

    initialize: function()
    {
      this.periodicUpdate = this.periodicUpdate.bind(this);
      this.loadData = this.loadData.bind(this);
      this.currentHour = -1;
      this.shiftStartInfo = null;
      this.actionTimer = {
        action: null,
        time: null
      };
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        showParentControls: window.parent !== window
      };
    },

    afterRender: function()
    {
      this.updateLine();
      this.periodicUpdate();
      this.loadData();

      if (window.parent !== window)
      {
        window.parent.postMessage({type: 'ready', app: 'heff'}, '*');
      }
    },

    loadData: function()
    {
      var view = this;
      var url = '/prodShifts?select(date,shift,quantitiesDone)&sort(date)'
        + '&prodLine=' + encodeURIComponent(view.model.prodLineId)
        + '&date=' + view.shiftStartInfo.moment.valueOf();

      clearTimeout(view.timers.loadData);

      view.ajax({url: url}).done(function(res)
      {
        if (res.collection && res.collection.length)
        {
          view.updateData(res.collection[0]);
        }

        view.timers.loadData = setTimeout(view.loadData, _.random(25000, 35000));
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

      var shift = t('core', 'SHIFT:' + this.shiftStartInfo.shift);

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

    updateData: function(prodShift)
    {
      var quantitiesDone = prodShift.quantitiesDone;
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

    startActionTimer: function(action, e)
    {
      this.actionTimer.action = action;
      this.actionTimer.time = Date.now();

      if (e)
      {
        e.preventDefault();
      }
    },

    stopActionTimer: function(action)
    {
      if (this.actionTimer.action !== action)
      {
        return;
      }

      var long = (Date.now() - this.actionTimer.time) > 3000;

      if (action === 'switchApps')
      {
        if (long)
        {
          window.parent.postMessage({type: 'config'}, '*');
        }
        else
        {
          window.parent.postMessage({type: 'switch', app: 'heff'}, '*');
        }
      }
      else if (action === 'reboot')
      {
        if (long)
        {
          window.parent.postMessage({type: 'reboot'}, '*');
        }
        else
        {
          window.parent.postMessage({type: 'refresh'}, '*');
        }
      }
      else if (long && action === 'shutdown')
      {
        window.parent.postMessage({type: 'shutdown'}, '*');
      }

      this.actionTimer.action = null;
      this.actionTimer.time = null;
    }

  });
});
