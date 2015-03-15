// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'require',
  'underscore',
  'jquery',
  'd3',
  'd3.timeline',
  'app/time',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/getShiftStartInfo',
  'app/data/downtimeReasons',
  'app/data/aors',
  'app/prodShiftOrders/util/calcOrderEfficiency',
  'app/prodShifts/templates/timelineIdlePopover',
  'app/prodShifts/templates/timelineWorkingPopover',
  'app/prodShifts/templates/timelineDowntimePopover'
], function(
  require,
  _,
  $,
  d3,
  timeline,
  time,
  t,
  user,
  viewport,
  View,
  getShiftStartInfo,
  downtimeReasons,
  aors,
  calcOrderEfficiency,
  renderTimelineIdlePopover,
  renderTimelineWorkingPopover,
  renderTimelineDowntimePopover
) {
  'use strict';

  return View.extend({

    className: 'prodShifts-timeline',

    events: {
      'click .prodShifts-timeline-addOrder': 'showAddOrderDialog',
      'click .prodShifts-timeline-editOrder': function()
      {
        this.showEditDialog(
          this.prodShiftOrders,
          'app/prodShiftOrders/views/ProdShiftOrderFormView'
        );
      },
      'click .prodShifts-timeline-deleteOrder': function()
      {
        this.showDeleteDialog(this.prodShiftOrders);
      },
      'click .prodShifts-timeline-addDowntime': 'showAddDowntimeDialog',
      'click .prodShifts-timeline-editDowntime': function()
      {
        this.showEditDialog(
          this.prodDowntimes,
          'app/prodDowntimes/views/ProdDowntimeFormView'
        );
      },
      'click .prodShifts-timeline-deleteDowntime': function()
      {
        this.showDeleteDialog(this.prodDowntimes);
      }
    },

    initialize: function()
    {
      this.chart = null;
      this.datum = null;
      this.beginning = -1;
      this.ending = -1;
      this.lastWidth = -1;
      this.popover = null;

      if (this.options.resizable !== false)
      {
        this.onWindowResize = _.debounce(this.onWindowResize.bind(this), 16);

        $(window).on('resize', this.onWindowResize);
      }

      if (this.options.editable !== false)
      {
        this.onDocumentClick = this.onDocumentClick.bind(this);

        $(document.body).on('click', this.onDocumentClick);
      }

      var render = _.debounce(this.render.bind(this), 1);
      var reset = _.debounce(this.reset.bind(this), 1);

      this.listenTo(this.prodShiftOrders, 'add remove change', render);
      this.listenTo(this.prodShiftOrders, 'reset', reset);
      this.listenTo(this.prodDowntimes, 'add remove change', render);
      this.listenTo(this.prodDowntimes, 'reset', reset);
    },

    destroy: function()
    {
      this.removeChart();

      this.chart = null;
      this.datum = null;

      if (this.options.resizable !== false)
      {
        $(window).off('resize', this.onWindowResize);
      }

      if (this.options.editable !== false)
      {
        $(document.body).off('click', this.onDocumentClick);
      }

      $(document.body).removeClass('prodShifts-extendedDowntime');

      d3.select(this.el).select('svg').remove();
    },

    getLastState: function()
    {
      var state = 'idle';
      var endingTime = 0;

      for (var i = 0, l = this.datum.length; i < l; ++i)
      {
        var datum = this.datum[i];
        var last = datum.times[datum.times.length - 1];

        if (!last)
        {
          continue;
        }

        if (last.ending_time >= endingTime)
        {
          endingTime = last.ending_time;
          state = datum.type;
        }
      }

      return state;
    },

    calcWidth: function()
    {
      return this.el.getBoundingClientRect().width - 28;
    },

    onWindowResize: function()
    {
      var width = this.calcWidth();

      if (width !== this.lastWidth)
      {
        this.lastWidth = width;

        this.renderChart();
      }
    },

    onDocumentClick: function(e)
    {
      if (e.target === document.body || !$(e.target).closest('.prodShifts-timeline-popover').length)
      {
        this.hidePopover();
      }
    },

    afterRender: function()
    {
      this.serializeDatum();

      if (!this.beginning)
      {
        return;
      }

      if (this.chart === null)
      {
        this.createChart();
      }

      this.renderChart();
      this.toggleExtendedDowntime();
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
        if (view.popover === null)
        {
          view.extendDatum();
          view.renderChart();
          view.toggleExtendedDowntime();
        }
      }

      this.timers.extendDatum = setInterval(extendDatum, 15000, this);
    },

    toggleExtendedDowntime: function()
    {
      var extendedDowntimeDelay = this.prodShift ? this.prodShift.get('extendedDowntimeDelay') : null;

      if (typeof extendedDowntimeDelay !== 'number')
      {
        return;
      }

      var prodDowntime = this.prodDowntimes.last();
      var extendedDowntime = false;

      if (prodDowntime && !prodDowntime.get('finishedAt'))
      {
        var startedAt = Date.parse(prodDowntime.get('startedAt'));
        var duration = Date.now() - startedAt;

        extendedDowntime = duration >= (extendedDowntimeDelay * 60 * 1000);
      }

      $('body').toggleClass('prodShifts-extendedDowntime', extendedDowntime);
    },

    reset: function()
    {
      this.chart = null;

      this.removeChart();
      this.render();
    },

    removeChart: function()
    {
      var parentEl = d3.select(this.el);
      var timelineEl = parentEl.select('svg');

      if (!timelineEl.empty())
      {
        timelineEl.remove();
      }
    },

    renderChart: function()
    {
      this.removeChart();

      var width = this.calcWidth();

      this.hidePopover();
      this.chart.width(width);

      d3.select(this.el)
        .append('svg')
        .attr('width', width)
        .datum(this.datum)
        .call(this.chart);
    },

    hidePopover: function()
    {
      if (this.popover !== null)
      {
        $(this.popover.el).popover('destroy');
        this.popover = null;
      }
    },

    serializeDatum: function()
    {
      var idles = [];
      var orders = [];
      var downtimes = [];
      var activeTimes = [];
      var nowTime = Date.now();

      this.beginning = this.prodShift
        ? Date.parse(this.prodShift.get('date'))
        : getShiftStartInfo(nowTime).moment.valueOf();

      var shiftEndTime = this.beginning + 8 * 3600 * 1000;
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
      var canManage = this.options.editable !== false && user.isAllowedTo('PROD_DATA:MANAGE');
      var itemHeight = this.options.itemHeight || 60;
      var downtimeHeight = Math.round(itemHeight * 0.833);

      this.chart = timeline()
        .beginning(this.beginning)
        .ending(this.beginning + 8 * 3600 * 1000)
        .itemHeight(itemHeight)
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
            this.setAttribute('height', downtimeHeight);
          }
        })
        .mouseover(function(item)
        {
          var itemEl = d3.event.target;

          if (view.popover !== null && view.popover.el === itemEl)
          {
            return;
          }

          view.hidePopover();

          var managing = canManage && d3.event.ctrlKey && item.ended;
          var $item = $(itemEl);

          $item.popover({
            trigger: 'manual',
            container: view.el,
            placement: 'top',
            html: true,
            title: t('prodShifts', 'timeline:popover:' + item.type),
            content: view.renderPopover(item, managing)
          });
          $item.popover('show');
          $item.data('bs.popover').$tip.addClass('popover-' + item.type);

          view.popover = {
            el: itemEl,
            item: item
          };
        })
        .mouseout(function()
        {
          if (view.options.editable === false || !d3.event.ctrlKey)
          {
            view.hidePopover();
          }
        })
        .mousedown(function()
        {
          d3.event.preventDefault();
        })
        .click(function(item)
        {
          var url = null;

          if (item.type === 'downtime' && user.isAllowedTo('PROD_DOWNTIMES:VIEW'))
          {
            url = 'prodDowntimes/' + item.data._id;
          }
          else if (item.type === 'working')
          {
            url = 'prodShiftOrders/' + item.data._id;
          }

          if (!url)
          {
            return;
          }

          if (d3.event.ctrlKey || d3.event.button === 1)
          {
            window.open('#' + url);
          }
          else
          {
            view.broker.publish('router.navigate', {
              url: '/' + url,
              trigger: true
            });
          }
        });
    },

    renderPopover: function(item, managing)
    {
      var duration = time.toString((item.ending_time - item.starting_time) / 1000);
      var templateData = {
        startedAt: time.format(item.starting_time, 'HH:mm:ss'),
        finishedAt: item.ended ? time.format(item.ending_time, 'HH:mm:ss') : '-',
        duration: duration,
        managing: managing
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
        templateData.efficiency = calcOrderEfficiency(item.data, true);

        return renderTimelineWorkingPopover(templateData);
      }

      if (item.type === 'downtime')
      {
        var reason = downtimeReasons.get(item.data.reason);
        var aor = aors.get(item.data.aor);

        templateData.reason = reason ? reason.getLabel() : item.data.reason;
        templateData.aor = aor ? aor.getLabel() : item.data.aor;
        templateData.hasOrder = !!item.data.prodShiftOrder;

        return renderTimelineDowntimePopover(templateData);
      }
    },

    showAddOrderDialog: function()
    {
      var view = this;
      var popoverItem = this.popover.item;

      require(
        [
          'app/prodShiftOrders/views/ProdShiftOrderFormView',
          'app/prodShiftOrders/ProdShiftOrder'
        ],
        function(AddFormView, ProdShiftOrder)
        {
          var prodShiftOrder = new ProdShiftOrder({
            prodShift: view.prodShift.id,
            master: view.prodShift.get('master'),
            leader: view.prodShift.get('leader'),
            operator: view.prodShift.get('operator'),
            operators: view.prodShift.get('operators'),
            workerCount: 1,
            quantityDone: 0,
            startedAt: new Date(popoverItem.starting_time),
            finishedAt: new Date(popoverItem.ending_time)
          });
          var nlsDomain = prodShiftOrder.getNlsDomain();

          viewport.showDialog(new AddFormView({
            dialogClassName: 'has-panel',
            model: prodShiftOrder,
            editMode: false,
            formMethod: 'POST',
            formAction: prodShiftOrder.url(),
            formActionText: t(nlsDomain, 'FORM:ACTION:add'),
            failureText: t(nlsDomain, 'FORM:ERROR:addFailure'),
            panelTitleText: t(nlsDomain, 'PANEL:TITLE:addForm'),
            done: function()
            {
              viewport.closeDialog();
            }
          }));
        }
      );
    },

    showAddDowntimeDialog: function()
    {
      var view = this;
      var popoverItem = this.popover.item;

      require(
        [
          'app/prodDowntimes/views/ProdDowntimeFormView',
          'app/prodDowntimes/ProdDowntime'
        ],
        function(AddFormView, ProdDowntime)
        {
          var prodDowntime = new ProdDowntime({
            prodShift: view.prodShift.id,
            prodShiftOrder: popoverItem.type === 'working' ? popoverItem.data._id : null,
            master: view.prodShift.get('master'),
            leader: view.prodShift.get('leader'),
            operator: view.prodShift.get('operator'),
            operators: view.prodShift.get('operators'),
            startedAt: new Date(popoverItem.starting_time),
            finishedAt: new Date(popoverItem.ending_time),
            status: 'undecided'
          });
          var nlsDomain = prodDowntime.getNlsDomain();

          viewport.showDialog(new AddFormView({
            dialogClassName: 'has-panel',
            model: prodDowntime,
            editMode: false,
            formMethod: 'POST',
            formAction: prodDowntime.url(),
            formActionText: t(nlsDomain, 'FORM:ACTION:add'),
            failureText: t(nlsDomain, 'FORM:ERROR:addFailure'),
            panelTitleText: t(nlsDomain, 'PANEL:TITLE:addForm'),
            done: function()
            {
              viewport.closeDialog();
            }
          }));
        }
      );
    },

    showEditDialog: function(collection, editFormViewModule)
    {
      var model = collection.get(this.popover.item.data._id);

      if (!model)
      {
        return;
      }

      this.promised(model.fetch()).then(function()
      {
        require([editFormViewModule], function(EditFormView)
        {
          var nlsDomain = model.getNlsDomain();

          viewport.showDialog(new EditFormView({
            dialogClassName: 'has-panel',
            model: model,
            editMode: true,
            formMethod: 'PUT',
            formAction: model.url(),
            formActionText: t(nlsDomain, 'FORM:ACTION:edit'),
            failureText: t(nlsDomain, 'FORM:ERROR:editFailure'),
            panelTitleText: t(nlsDomain, 'PANEL:TITLE:editForm'),
            done: function()
            {
              viewport.closeDialog();
            }
          }));
        });
      });
    },

    showDeleteDialog: function(collection)
    {
      var model = collection.get(this.popover.item.data._id);

      if (!model)
      {
        return;
      }

      this.promised(model.fetch()).then(function()
      {
        require(['app/core/views/ActionFormView'], function(ActionFormView)
        {
          ActionFormView.showDeleteDialog({model: model});
        });
      });
    }

  });
});
