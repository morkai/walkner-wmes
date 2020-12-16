// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

/* eslint-disable camelcase */

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
  'app/prodChangeRequests/util/createDeletePageAction',
  'app/prodShifts/templates/timelineIdlePopover',
  'app/prodShifts/templates/timelineWorkingPopover',
  'app/prodShifts/templates/timelineDowntimePopover',
  'app/prodShifts/templates/timelineWhPopover'
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
  createDeletePageAction,
  timelineIdlePopoverTemplate,
  timelineWorkingPopoverTemplate,
  timelineDowntimePopoverTemplate,
  timelineWhPopoverTemplate
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
      },
      'mouseover .popover': function()
      {
        if (this.timers.hidePopover)
        {
          clearTimeout(this.timers.hidePopover);
          this.timers.hidePopover = null;
        }
      }
    },

    model: {
      nlsDomain: 'prodShifts'
    },

    initialize: function()
    {
      this.chart = null;
      this.datum = null;
      this.beginning = -1;
      this.ending = -1;
      this.lastWidth = -1;
      this.popover = null;
      this.highlightedItem = null;

      if (this.options.resizable !== false)
      {
        this.onWindowResize = _.debounce(this.onWindowResize.bind(this), 16);

        $(window).on('resize.' + this.idPrefix, this.onWindowResize);
      }

      if (this.options.editable !== false)
      {
        this.onDocumentClick = this.onDocumentClick.bind(this);

        $(document.body).on('click.' + this.idPrefix, this.onDocumentClick);
      }

      var render = _.debounce(this.render.bind(this), 1);
      var reset = _.debounce(this.reset.bind(this), 1);

      this.listenTo(this.prodShiftOrders, 'add remove change', render);
      this.listenTo(this.prodShiftOrders, 'reset', reset);
      this.listenTo(this.prodDowntimes, 'add remove change', render);
      this.listenTo(this.prodDowntimes, 'reset', reset);

      if (this.whOrderStatuses)
      {
        this.listenTo(this.whOrderStatuses, 'add remove change', render);
        this.listenTo(this.whOrderStatuses, 'reset', reset);
      }
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      $(document.body).off('.' + this.idPrefix);

      this.hidePopover();
      this.removeChart();

      this.chart = null;
      this.datum = null;

      $(document.body).removeClass('prodShifts-extendedDowntime');

      d3.select(this.el).select('svg').remove();
    },

    getLastState: function()
    {
      var state = 'idle';

      if (!this.datum)
      {
        return state;
      }

      var endingTime = 0;

      for (var i = 0, l = this.datum.length; i < l; ++i)
      {
        var datum = this.datum[i];

        if (datum.type === 'wh')
        {
          continue;
        }

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
      return Math.max(this.el.getBoundingClientRect().width - 28, 300);
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
      if (!this.timers)
      {
        return;
      }

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
        view.extendDatum();

        if (view.popover === null)
        {
          view.renderChart();
          view.toggleExtendedDowntime();
        }
        else
        {
          view.updatePopover();
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

      if (!this.chart)
      {
        return;
      }

      this.chart.width(width);

      d3.select(this.el)
        .append('svg')
        .attr('width', width)
        .datum(this.datum)
        .call(this.chart);

      if (this.highlightedItem)
      {
        this.highlightItem(this.highlightedItem);
      }
    },

    canManage: function()
    {
      return this.options.editable !== false
        && user.isAllowedTo('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST');
    },

    showPopover: function(item, itemEl)
    {
      var view = this;

      if (view.popover !== null && view.popover.el === itemEl)
      {
        return;
      }

      view.hidePopover();

      var managing = this.canManage() && item.ended;
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
      $item.data('bs.popover').tip().addClass('popover-' + item.type);

      view.popover = {
        el: itemEl,
        item: item
      };
    },

    hidePopover: function(delay)
    {
      if (this.timers && this.timers.hidePopover)
      {
        clearTimeout(this.timers.hidePopover);
        this.timers.hidePopover = null;
      }

      if (this.popover === null)
      {
        return;
      }

      if (delay)
      {
        this.timers.hidePopover = setTimeout(this.hidePopover.bind(this), 200, false);
      }
      else
      {
        $(this.popover.el).popover('destroy');
        this.popover = null;
      }
    },

    updatePopover: function()
    {
      if (!this.popover)
      {
        return;
      }

      var html = this.renderPopover(
        this.popover.item,
        this.canManage() && this.popover.item.ended
      );

      $(this.popover.el).data('bs.popover').$tip.find('.popover-content').html(html);
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
          taktTimeOk: prodShiftOrder.isTaktTimeOk(),
          data: prodShiftOrder.toJSON(),
          model: prodShiftOrder,
          text: prodShiftOrder.get('orderId')
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
          data: prodDowntime.toJSON(),
          model: prodDowntime,
          text: prodDowntime.get('reason')
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

      if (this.whOrderStatuses)
      {
        this.datum.push(this.createWhDatum());
      }

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

    createWhDatum: function()
    {
      var startingTime = this.beginning;

      for (var i = 0; i < 3; ++i)
      {
        var datum = this.datum[i];

        if (datum.times.length)
        {
          startingTime = Math.max(startingTime, _.last(datum.times).ending_time);
        }
      }

      var currentOrder = _.last(this.datum[1].times);

      if (!currentOrder)
      {
        return {type: 'wh', times: []};
      }

      var data = this.whOrderStatuses.getTimelineData(this.prodLineId, currentOrder.model);
      var qtyDone = currentOrder.model.get('quantityDone');
      var qtyRemaining = data.qtySent - qtyDone;

      return {
        type: 'wh',
        times: [{
          type: 'wh',
          text: qtyRemaining >= 1
            ? ('~' + time.toString(qtyRemaining * data.pceTime / 1000))
            : '',
          data: {
            qtyDone: qtyDone,
            qtySent: data.qtySent,
            pceTime: data.pceTime
          },
          model: {},
          starting_time: startingTime,
          ending_time: this.beginning + 8 * 3600 * 1000
        }]
      };
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

      var newEndingTime = null;

      this.datum.forEach(function(datum)
      {
        var last = datum.times.length - 1;

        if (last > -1 && datum.times[last].ended === false)
        {
          datum.times[last].ending_time = newEndingTime = endingTime;
        }
      });

      if (newEndingTime && this.datum[3] && this.datum[3].times.length)
      {
        this.datum[3].times[0].starting_time = newEndingTime;
      }
    },

    createChart: function()
    {
      var view = this;
      var itemHeight = this.options.itemHeight || 60;
      var downtimeHeight = Math.round(itemHeight * 0.5);

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
          format: d3.time.format('%H:%M'),
          tickTime: d3.time.hours,
          tickNumber: 1,
          tickSize: 5
        })
        .colors(false)
        .itemClassName(function(item)
        {
          var className = 'timeline-item timeline-item-' + item.type;

          if (item.type === 'working' && !item.taktTimeOk)
          {
            className += ' is-tt-nok';
          }

          if (item.type === 'downtime' && item.model.isBreak())
          {
            className += ' is-break';
          }

          return className;
        })
        .afterRender(function(item)
        {
          if (item.data && item.data._id)
          {
            this.setAttribute('data-model-id', item.data._id);
          }

          if (item.type === 'downtime' && item.data.prodShiftOrder)
          {
            this.setAttribute('height', downtimeHeight);
          }

          if (item.text)
          {
            d3.select(this.parentNode).append('foreignObject')
              .attr({
                width: Math.max(0, parseInt(this.getAttribute('width'), 10) - 5),
                x: parseInt(this.getAttribute('x'), 10) + 3,
                y: parseInt(this.getAttribute('y'), 10) + parseInt(this.getAttribute('height'), 10) - 19,
                class: 'prodShifts-timeline-text',
                'data-type': item.type
              })
              .html('<span>' + item.text + '</span>');
          }
        })
        .mouseover(function(item)
        {
          view.showPopover(item, d3.event.target);
        })
        .mouseout(function()
        {
          if (view.options.editable === false)
          {
            view.hidePopover();
          }
          else if (!d3.event.ctrlKey)
          {
            view.hidePopover(true);
          }
        })
        .mousedown(function()
        {
          d3.event.preventDefault();
        })
        .click(function(item)
        {
          var url = null;

          if (item.type === 'downtime' && user.isAllowedTo('LOCAL', 'PROD_DATA:VIEW', 'PROD_DOWNTIMES:VIEW'))
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
            window.open('/#' + url);
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
        startedAt: time.format(item.starting_time, 'LTS'),
        finishedAt: item.ended ? time.format(item.ending_time, 'LTS') : '-',
        duration: duration,
        managing: managing
      };
      var type = item.type;
      var data = item.data;
      var model = item.model;

      if (type === 'idle')
      {
        return this.renderPartialHtml(timelineIdlePopoverTemplate, templateData);
      }

      if (type === 'working')
      {
        var efficiency = model.getEfficiency({prodDowntimes: this.prodDowntimes});

        if (efficiency)
        {
          efficiency *= 100;
        }
        else
        {
          efficiency = model.getTaktTimeEfficiency();
        }

        templateData.order = data.orderId;
        templateData.operation = data.operationNo;
        templateData.workerCount = data.workerCount;
        templateData.quantityDone = data.quantityDone;
        templateData.efficiency = efficiency ? (Math.round(efficiency) + '%') : '?';
        templateData.sapTaktTime = model.get('sapTaktTime');
        templateData.lastTaktTime = model.getLastTaktTime();
        templateData.avgTaktTime = model.getAvgTaktTime();

        return this.renderPartialHtml(timelineWorkingPopoverTemplate, templateData);
      }

      if (type === 'downtime')
      {
        var reason = downtimeReasons.get(data.reason);
        var aor = aors.get(data.aor);

        templateData.reason = reason ? reason.getLabel() : data.reason;
        templateData.aor = aor ? aor.getLabel() : data.aor;
        templateData.hasOrder = !!data.prodShiftOrder;

        return this.renderPartialHtml(timelineDowntimePopoverTemplate, templateData);
      }

      if (type === 'wh')
      {
        templateData.currentQty = data.qtySent - data.qtyDone;
        templateData.currentTime = time.toString(
          templateData.currentQty > 0 ? (templateData.currentQty * data.pceTime / 1000) : 0
        );
        templateData.nextQty = '0';
        templateData.nextTime = '0s';

        return this.renderPartialHtml(timelineWhPopoverTemplate, templateData);
      }
    },

    showAddOrderDialog: function()
    {
      var view = this;

      if (!view.popover)
      {
        return;
      }

      var popoverItem = view.popover.item;

      require(
        [
          'app/prodShiftOrders/views/ProdShiftOrderFormView',
          'app/prodShiftOrders/ProdShiftOrder'
        ],
        function(AddFormView, ProdShiftOrder)
        {
          var prodShift = view.prodShift;
          var prodShiftOrder = new ProdShiftOrder({
            prodShift: prodShift.id,
            division: prodShift.get('division'),
            subdivision: prodShift.get('subdivision'),
            mrpControllers: prodShift.get('mrpControllers'),
            prodFlow: prodShift.get('prodFlow'),
            workCenter: prodShift.get('workCenter'),
            prodLine: prodShift.get('prodLine'),
            master: prodShift.get('master'),
            leader: prodShift.get('leader'),
            operator: prodShift.get('operator'),
            operators: prodShift.get('operators'),
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

      if (!view.popover)
      {
        return;
      }

      var popoverItem = view.popover.item;

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
      if (!this.popover)
      {
        return;
      }

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
      if (!this.popover)
      {
        return;
      }

      var model = collection.get(this.popover.item.data._id);

      if (!model)
      {
        return;
      }

      var view = this;

      this.promised(model.fetch()).then(function()
      {
        createDeletePageAction(view, model).callback();
      });
    },

    highlightItem: function(modelId, showPopover)
    {
      var view = this;
      var $item = view.$('.timeline-item[data-model-id="' + modelId + '"]');

      if ($item.length)
      {
        $item[0].classList.add('is-highlighted');
      }

      view.highlightedItem = modelId;

      if (!showPopover)
      {
        return;
      }

      var item = null;

      [1, 2].forEach(function(d)
      {
        view.datum[d].times.forEach(function(itemCandidate)
        {
          if (itemCandidate.data && itemCandidate.data._id === modelId)
          {
            item = itemCandidate;
          }
        });
      });

      if (item)
      {
        view.showPopover(item, $item[0]);
      }
    }

  });
});
