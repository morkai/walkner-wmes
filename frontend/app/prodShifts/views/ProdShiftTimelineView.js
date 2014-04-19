// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'd3',
  'd3.timeline',
  'app/time',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/data/downtimeReasons',
  'app/data/aors',
  'app/prodShifts/templates/timelineIdlePopover',
  'app/prodShifts/templates/timelineWorkingPopover',
  'app/prodShifts/templates/timelineDowntimePopover'
], function(
  _,
  $,
  d3,
  timeline,
  time,
  t,
  user,
  View,
  downtimeReasons,
  aors,
  renderTimelineIdlePopover,
  renderTimelineWorkingPopover,
  renderTimelineDowntimePopover
) {
  'use strict';

  return View.extend({

    className: 'prodShifts-timeline',

    initialize: function()
    {
      this.chart = null;
      this.datum = null;
      this.beginning = -1;
      this.ending = -1;
      this.lastWidth = -1;

      this.onResize = _.debounce(this.onResize.bind(this), 100);

      $(window).resize(this.onResize);

      this.listenTo(this.prodShiftOrders, 'add', this.render);
      this.listenTo(this.prodShiftOrders, 'remove', this.render);
      this.listenTo(this.prodShiftOrders, 'change', this.render);
      this.listenTo(this.prodDowntimes, 'add', this.render);
      this.listenTo(this.prodDowntimes, 'remove', this.render);
      this.listenTo(this.prodDowntimes, 'change', this.render);
    },

    destroy: function()
    {
      this.chart = null;
      this.datum = null;

      $(window).off('resize', this.onResize);

      d3.select(this.el).select('svg').remove();
    },

    onResize: function()
    {
      var width = this.el.getBoundingClientRect().width;

      if (width !== this.lastWidth)
      {
        this.lastWidth = width;

        this.renderChart();
      }
    },

    afterRender: function()
    {
      this.serializeDatum();

      if (this.chart === null)
      {
        this.createChart();
      }

      this.renderChart();
      this.setUpDatumExtension();
    },

    setUpDatumExtension: function()
    {
      if (this.timers.extendDatum)
      {
        clearTimeout(this.timers.extendDatum);
      }

      if (this.ending >= (this.beginning + 8 * 3600 * 1000))
      {
        return;
      }

      function extendDatum(view)
      {
        view.extendDatum();
        view.renderChart();
      }

      this.timers.extendDatum = setInterval(extendDatum, 10000, this);
    },

    renderChart: function()
    {
      var parentEl = d3.select(this.el);
      var timelineEl = parentEl.select('svg');

      if (!timelineEl.empty())
      {
        timelineEl.remove();
      }

      this.chart.width(null);

      parentEl
        .append('svg')
        .attr('width', this.el.getBoundingClientRect().width)
        .datum(this.datum)
        .call(this.chart);
    },

    serializeDatum: function()
    {
      var idles = [];
      var orders = [];
      var downtimes = [];
      var activeTimes = [];

      this.beginning = Date.parse(this.prodShift.get('date'));

      var shiftEndTime = this.beginning + 8 * 3600 * 1000;
      var nowTime = Date.now();
      var shiftEnded = nowTime >= shiftEndTime;
      var endingTime = Math.min(nowTime, shiftEndTime);

      this.ending = endingTime;

      this.prodShiftOrders.forEach(function(prodShiftOrder)
      {
        var startingTime = Date.parse(prodShiftOrder.get('startedAt'));
        var endingTime = Date.parse(prodShiftOrder.get('finishedAt'));

        activeTimes.push({from: startingTime, to: endingTime});

        orders.push({
          type: 'working',
          starting_time: startingTime,
          ending_time: endingTime || -1,
          ended: !isNaN(endingTime),
          data: prodShiftOrder.toJSON()
        });
      });

      this.prodDowntimes.forEach(function(prodDowntime)
      {
        var startingTime = Date.parse(prodDowntime.get('startedAt'));
        var endingTime = Date.parse(prodDowntime.get('finishedAt'));

        if (!prodDowntime.get('prodShiftOrder'))
        {
          activeTimes.push({from: startingTime, to: endingTime});
        }

        downtimes.push({
          type: 'downtime',
          starting_time: startingTime,
          ending_time: endingTime || -1,
          ended: !isNaN(endingTime),
          data: prodDowntime.toJSON()
        });
      });

      activeTimes.sort(function(a, b)
      {
        return a.from - b.from;
      });

      var idleEndingTime = activeTimes.length === 0
        ? (shiftEnded ? endingTime : -1)
        : activeTimes[0].from;

      idles.push({
        type: 'idle',
        starting_time: this.beginning,
        ending_time: idleEndingTime,
        ended: idleEndingTime !== -1
      });

      for (var i = 0, l = activeTimes.length; i < l; ++i)
      {
        var b = activeTimes[i + 1];

        if (!b)
        {
          break;
        }

        var a = activeTimes[i];

        if (b.from - a.to > 1000)
        {
          idles.push({
            type: 'idle',
            starting_time: a.to,
            ending_time: b.from,
            ended: true
          });
        }
      }

      if (activeTimes.length && activeTimes[activeTimes.length - 1].to < shiftEndTime)
      {
        idles.push({
          type: 'idle',
          starting_time: activeTimes[activeTimes.length - 1].to,
          ending_time: shiftEnded ? shiftEndTime : -1,
          ended: shiftEnded
        });
      }

      this.datum = [
        {type: 'idle', times: endDatum(idles)},
        {type: 'working', times: endDatum(orders)},
        {type: 'downtime', times: endDatum(downtimes)}
      ];

      function endDatum(list)
      {
        if (list.length && list[list.length - 1].ending_time === -1)
        {
          list[list.length - 1].ending_time = endingTime;
          list[list.length - 1].ended = false;
        }

        return list;
      }
    },

    extendDatum: function()
    {
      var endingTime = Date.now();
      var shiftEndTime = this.beginning + 8 * 3600 * 1000;

      if (endingTime >= shiftEndTime)
      {
        clearTimeout(this.timers.extendDatum);
        this.timers.extendDatum = null;

        endingTime = shiftEndTime;
      }

      this.datum.forEach(function(datum)
      {
        var last = datum.times.length -1;

        if (last > -1 && datum.times[last].ended === false)
        {
          datum.times[last].ending_time = endingTime;
        }
      });
    },

    createChart: function()
    {
      var view = this;

      this.chart = timeline()
        .beginning(this.beginning)
        .ending(this.beginning + 8 * 3600 * 1000)
        .itemHeight(60)
        .margin({
          left: 20,
          right: 20,
          top: 1,
          bottom: 0
        })
        .tickFormat({
          format: d3.time.format("%H:%M"),
          tickTime: d3.time.hours,
          tickNumber: 1,
          tickSize: 5
        })
        .colors(false)
        .itemClassName(function(item)
        {
          return 'timeline-item timeline-item-' + item.type;
        })
        .afterRender(function(item)
        {
          if (item.type === 'downtime' && item.data.prodShiftOrder)
          {
            this.setAttribute('height', '50');
            this.setAttribute('y', 11);
          }
        })
        .mouseover(function(item)
        {
          var $item = $(d3.event.target);

          $item.popover({
            trigger: 'manual',
            container: view.el,
            placement: 'auto top',
            html: true,
            title: t('prodShifts', 'timeline:popover:' + item.type),
            content: view.renderPopover(item)
          });
          $item.popover('show');
          $item.data('bs.popover').$tip.addClass('popover-' + item.type);
        })
        .mouseout(function()
        {
          $(this).popover('destroy');
        })
        .click(function(item)
        {
          if (item.type === 'downtime' && user.isAllowedTo('PROD_DOWNTIMES:VIEW'))
          {
            view.broker.publish('router.navigate', {
              url: '/prodDowntimes/' + item.data._id,
              trigger: true
            });
          }
          else if (item.type === 'working')
          {
            view.broker.publish('router.navigate', {
              url: '/prodShiftOrders/' + item.data._id,
              trigger: true
            });
          }
        });
    },

    renderPopover: function(item)
    {
      var duration = time.toString((item.ending_time - item.starting_time) / 1000);
      var templateData = {
        startedAt: time.format(item.starting_time, 'HH:mm:ss'),
        finishedAt: item.ended ? time.format(item.ending_time, 'HH:mm:ss') : '-',
        duration: duration
      };

      if (item.type === 'idle')
      {
        return renderTimelineIdlePopover(templateData);
      }

      if (item.type === 'working')
      {
        templateData.order = item.data.orderId;
        templateData.operation = item.data.operationNo;
        templateData.workerCount = item.data.workerCount;
        templateData.quantityDone = item.data.quantityDone;

        return renderTimelineWorkingPopover(templateData);
      }

      if (item.type === 'downtime')
      {
        var reason = downtimeReasons.get(item.data.reason);
        var aor = aors.get(item.data.aor);

        templateData.reason = reason ? reason.getLabel() : item.data.reason;
        templateData.aor = aor ? aor.getLabel() : item.data.aor;

        return renderTimelineDowntimePopover(templateData);
      }
    }

  });
});
