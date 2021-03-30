// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/util/getShiftStartInfo',
  'app/data/downtimeReasons',
  'app/data/aors',
  'app/production/templates/executionTimeline',
  'app/production/templates/executionTimelineItem',
  'app/production/templates/executionOrderPopover',
  'app/production/templates/executionDowntimePopover'
], function(
  $,
  t,
  time,
  View,
  getShiftStartInfo,
  downtimeReasons,
  aors,
  template,
  itemTemplate,
  orderPopoverTemplate,
  downtimePopoverTemplate
) {
  'use strict';

  var SHIFT_DURATION = 8 * 3600 * 1000;

  return View.extend({

    template: template,

    events: {

      'click .production-timeline-item[data-type="order"]': function(e)
      {
        if (document.getSelection().toString() !== '')
        {
          return;
        }

        var order = this.model.get(this.orderProp)[e.currentTarget.dataset.id];

        this.model.trigger('newOrderRequested', order);
      }

    },

    initialize: function()
    {
      this.orderProp = this.options.type + 'Orders';
      this.downtimeProp = this.options.type + 'Downtimes';

      this.listenTo(this.model, 'change:' + this.orderProp, this.renderOrders);
      this.listenTo(this.model, 'change:' + this.downtimeProp, this.renderDowntimes);

      if (this.options.type === 'done')
      {
        this.listenTo(this.model, 'change:lastOrder', this.updateLastItem.bind(this, 'order'));
        this.listenTo(this.model, 'change:lastDowntime', this.updateLastItem.bind(this, 'downtime'));
      }
    },

    afterRender: function()
    {
      var view = this;

      view.$el.popover({
        container: 'body',
        selector: '.production-timeline-item',
        trigger: 'hover',
        placement: 'auto top',
        html: true,
        content: function()
        {
          if (this.dataset.type === 'order')
          {
            return view.renderOrderPopover(this.dataset.id);
          }

          if (this.dataset.type === 'downtime')
          {
            return view.renderDowntimePopover(this.dataset.id);
          }
        },
        template: function(defaultTemplate)
        {
          return $(defaultTemplate).addClass('production-execution-popover');
        }
      });

      this.renderOrders();
      this.renderDowntimes();
      this.scheduleExtendLastItems();
    },

    renderOrders: function()
    {
      this.renderItems('order');
    },

    renderDowntimes: function()
    {
      this.renderItems('downtime');
    },

    renderItems: function(type)
    {
      var view = this;
      var items = view.model.get(view[type + 'Prop']) || [];
      var shiftStartedAt = items.length ? getShiftStartInfo(items[0].startedAt).startTime : 0;
      var now = Date.now();

      var html = items
        .map(function(item, i) { return view.renderItem(type, item, i, shiftStartedAt, now); })
        .join('');

      view.$el.find('.production-timeline-item[data-type="' + type + '"]').remove();
      view.$el.append(html);

      view.scheduleExtendLastItems();
    },

    renderItem: function(type, item, i, shiftStartedAt, now)
    {
      if (!shiftStartedAt)
      {
        shiftStartedAt = getShiftStartInfo(item.startedAt).startTime;
      }

      if (!now)
      {
        now = Date.now();
      }

      var startedAt = Date.parse(item.startedAt);
      var finishedAt = Date.parse(item.finishedAt) || now;
      var duration = finishedAt - startedAt;
      var width = duration / SHIFT_DURATION * 100;
      var left = (startedAt - shiftStartedAt) / SHIFT_DURATION * 100;

      return itemTemplate({
        type: type,
        id: i,
        label: t('production', 'execution:' + type + ':label', item),
        taktTime: item.taktTime || 'na',
        width: width,
        left: left
      });
    },

    updateLastItem: function(type)
    {
      var view = this;
      var items = view.model.get(view[type + 'Prop']) || [];
      var lastI = items.length - 1;

      if (lastI === -1)
      {
        return;
      }

      var lastItem = items[lastI];

      this.$('.production-timeline-item[data-type="' + type + '"][data-id="' + lastI + '"]').replaceWith(
        this.renderItem(type, lastItem, lastI)
      );
    },

    scheduleExtendLastItems: function()
    {
      clearTimeout(this.timers.extendLastItems);
      this.timers.extendLastItems = setTimeout(this.extendLastItems.bind(this), 60000);
    },

    extendLastItems: function()
    {
      this.extendLastItem('order');
      this.extendLastItem('downtime');
    },

    extendLastItem: function(type)
    {
      this.scheduleExtendLastItems();

      var items = this.model.get(this[type + 'Prop']) || [];
      var lastI = items.length - 1;
      var last = items[lastI];

      if (!last || last.finishedAt)
      {
        return;
      }

      var $item = this.$('.production-timeline-item[data-type="' + type + '"][data-id="' + lastI + '"]');
      var startedAt = Date.parse(last.startedAt);
      var duration = Date.now() - startedAt;
      var width = duration / SHIFT_DURATION * 100;

      $item[0].style.width = width + '%';
    },

    renderOrderPopover: function(i)
    {
      var order = this.model.get(this.orderProp)[i];

      return !order ? undefined : this.renderPartialHtml(orderPopoverTemplate, {
        order: {
          orderNo: order.orderId,
          operationNo: order.operationNo,
          quantityDone: (order.quantityDone || 0).toLocaleString(),
          workerCount: (order.workerCount || 0).toLocaleString(),
          startedAt: time.format(order.startedAt, 'HH:mm:ss'),
          finishedAt: order.finishedAt ? time.format(order.finishedAt, 'HH:mm:ss') : '-'
        }
      });
    },

    renderDowntimePopover: function(i)
    {
      var downtime = this.model.get(this.downtimeProp)[i];
      var reason = downtimeReasons.get(downtime.reason);
      var aor = aors.get(downtime.aor);

      return !downtime ? undefined : this.renderPartialHtml(downtimePopoverTemplate, {
        downtime: {
          reason: reason ? reason.getLabel() : downtime.reason,
          aor: aor ? aor.getLabel() : aor.reason,
          startedAt: time.format(downtime.startedAt, 'HH:mm:ss'),
          finishedAt: downtime.finishedAt ? time.format(downtime.finishedAt, 'HH:mm:ss') : '-'
        }
      });
    }

  });
});
