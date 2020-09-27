// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/planning/util/shift',
  './QuantitiesDoneChartView',
  'app/heff/templates/hourlyEfficiency'
], function(
  time,
  View,
  shiftUtil,
  QuantitiesDoneChartView,
  template
) {
  'use strict';

  return View.extend({

    swapDelay: 20000,

    template: template,

    initialize: function()
    {
      this.setView('#-chart', new QuantitiesDoneChartView({
        model: this.model.prodShift
      }));

      this.listenTo(this.model.prodShift, 'reset change:quantitiesDone', this.onQuantitiesDoneChanged);
    },

    getTitle: function(shiftInfo, now)
    {
      return this.t('hourly:title', {
        from: shiftInfo.moment.format('H:00'),
        to: now.clone().add(1, 'hours').format('H:00')
      });
    },

    activate: function()
    {
      this.updateData();
    },

    deactivate: function()
    {

    },

    periodicUpdate: function()
    {

    },

    updateData: function()
    {
      var quantitiesDone = this.model.prodShift.get('quantitiesDone');

      if (!Array.isArray(quantitiesDone) || quantitiesDone.length !== 8)
      {
        return;
      }

      var currentTime = time.getMoment();
      var currentHour = currentTime.hours();
      var currentHourIndex = shiftUtil.HOUR_TO_INDEX_SHIFT[currentHour];
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

      this.$id('icon')
        .removeClass('fa-smile-o fa-frown-o fa-meh-o')
        .addClass(totalActual >= currentPlanned ? 'fa-smile-o' : 'fa-frown-o');
    },

    onQuantitiesDoneChanged: function()
    {
      this.updateData();
    }

  });
});
