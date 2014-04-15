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

    beforeRender: function()
    {
      this.stopListening(this.collection, 'reset', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.collection, 'reset', this.render);

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
      /*jshint -W015*/

      this.beginning = -1;

      var i = 0;
      var l = this.collection.length;

      var orderToItemMap = {};
      var downtimeToItemMap = {};
      var idles = [];
      var orders = [];
      var downtimes = [];

      function pushDatum(type, list, prodLogEntry, startingTime)
      {
        var item = {
          type: type,
          prodLogEntry: prodLogEntry,
          starting_time: startingTime,
          ending_time: -1,
          ended: true
        };

        list.push(item);

        var data = prodLogEntry.get('data');

        if (type === 'working')
        {
          item.quantityDone = 0;
          item.workerCount = 0;

          orderToItemMap[data._id] = item;
        }
        else if (type === 'downtime')
        {
          item.hasOrder = data.prodShiftOrder !== null;

          downtimeToItemMap[data._id] = item;
        }
      }

      for (; i < l; ++i)
      {
        var prodLogEntry = this.collection.at(i);
        var prodShiftOrder = prodLogEntry.get('prodShiftOrder');
        var prodShiftOrderId = prodShiftOrder ? prodShiftOrder._id : null;
        var type = prodLogEntry.get('type');
        var data = prodLogEntry.get('data');
        var item;

        if (this.beginning === -1)
        {
          if (type === 'changeShift')
          {
            this.beginning = Date.parse(data.startedProdShift.date);

            pushDatum('idle', idles, prodLogEntry, this.beginning);
          }

          continue;
        }

        switch (type)
        {
          case 'changeOrder':
            var startingTime = Date.parse(data.startedAt);

            if (idles[idles.length - 1].ending_time === -1)
            {
              idles[idles.length - 1].ending_time = startingTime;
            }

            pushDatum('working', orders, prodLogEntry, startingTime);
            break;

          case 'correctOrder':
            item = orderToItemMap[prodShiftOrderId];

            if (item)
            {
              var relatedEntryData = item.prodLogEntry.get('data');

              relatedEntryData.orderId = data.orderId;
              relatedEntryData.operationNo = data.operationNo;
            }
            break;

          case 'finishOrder':
            item = orderToItemMap[prodShiftOrderId];

            if (item && item.ending_time === -1)
            {
              item.ending_time = Date.parse(data.finishedAt);
            }
            break;

          case 'startDowntime':
            pushDatum('downtime', downtimes, prodLogEntry, Date.parse(data.startedAt));
            break;

          case 'finishDowntime':
            item = downtimeToItemMap[data._id];

            if (item && item.ending_time === -1)
            {
              item.ending_time = Date.parse(data.finishedAt);
            }
            break;

          case 'endWork':
            pushDatum('idle', idles, prodLogEntry, Date.parse(prodLogEntry.get('createdAt')));
            break;

          case 'changeQuantityDone':
            item = orderToItemMap[prodShiftOrderId];

            if (item)
            {
              item.quantityDone = data.newValue;
            }
            break;

          case 'changeWorkerCount':
            item = orderToItemMap[prodShiftOrderId];

            if (item)
            {
              item.workerCount = data.newValue;
            }
            break;

          case 'editOrder':
            item = orderToItemMap[prodShiftOrderId];

            if (!item)
            {
              break;
            }

            if (data.quantityDone !== undefined)
            {
              item.quantityDone = data.quantityDone;
            }

            if (data.workerCount !== undefined)
            {
              item.workerCount = data.workerCount;
            }

            if (data.startedAt !== undefined)
            {
              item.starting_time = Date.parse(data.startedAt);
            }

            if (data.finishedAt !== undefined)
            {
              item.ending_time = Date.parse(data.finishedAt);
            }

            item.prodLogEntry.set('data', _.extend(item.prodLogEntry.get('data'), data));
            break;

          case 'editDowntime':
            item = downtimeToItemMap[data._id];

            if (!item)
            {
              break;
            }

            if (data.startedAt !== undefined)
            {
              item.starting_time = Date.parse(data.startedAt);
            }

            if (data.finishedAt !== undefined)
            {
              item.ending_time = Date.parse(data.finishedAt);
            }

            item.prodLogEntry.set('data', _.extend(item.prodLogEntry.get('data'), data));
            break;

          case 'deleteDowntime':
            item = downtimeToItemMap[data._id];

            if (!item)
            {
              break;
            }

            delete downtimeToItemMap[data._id];

            downtimes.splice(downtimes.indexOf(item), 1);
            break;

          case 'deleteOrder':
            item = orderToItemMap[data._id];

            if (!item)
            {
              break;
            }

            delete orderToItemMap[data._id];

            orders.splice(orders.indexOf(item), 1);
            break;
        }
      }

      var endingTime = this.ending = Math.min(Date.now(), this.beginning + 8 * 3600 * 1000);

      function endDatum(list)
      {
        if (list.length && list[list.length - 1].ending_time === -1)
        {
          list[list.length - 1].ending_time = endingTime;
          list[list.length - 1].ended = false;
        }

        return list;
      }

      this.datum = [
        {type: 'idle', times: endDatum(idles)},
        {type: 'working', times: endDatum(orders)},
        {type: 'downtime', times: endDatum(downtimes)}
      ];
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
          if (item.type === 'downtime' && item.hasOrder)
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
              url: '/prodDowntimes/' + item.prodLogEntry.get('data')._id,
              trigger: true
            });
          }
          else if (item.type === 'working')
          {
            view.broker.publish('router.navigate', {
              url: '/prodShiftOrders/' + item.prodLogEntry.get('data')._id,
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

      var prodLogEntryData = item.prodLogEntry.get('data');

      if (item.type === 'working')
      {
        templateData.order = prodLogEntryData.orderId;
        templateData.operation = prodLogEntryData.operationNo;
        templateData.workerCount = item.workerCount;
        templateData.quantityDone = item.quantityDone;

        return renderTimelineWorkingPopover(templateData);
      }

      if (item.type === 'downtime')
      {
        var reason = downtimeReasons.get(prodLogEntryData.reason);
        var aor = aors.get(prodLogEntryData.aor);

        templateData.reason = reason ? reason.getLabel() : prodLogEntryData.reason;
        templateData.aor = aor ? aor.getLabel() : prodLogEntryData.aor;

        return renderTimelineDowntimePopover(templateData);
      }
    }

  });
});
