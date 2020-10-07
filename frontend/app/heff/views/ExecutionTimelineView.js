// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/util/getShiftStartInfo',
  'app/data/downtimeReasons',
  'app/data/aors',
  'app/heff/templates/executionTimeline',
  'app/heff/templates/executionTimelineItem'
], function(
  _,
  $,
  t,
  time,
  View,
  getShiftStartInfo,
  downtimeReasons,
  aors,
  template,
  itemTemplate
) {
  'use strict';

  var SHIFT_DURATION = 8 * 3600 * 1000;

  return View.extend({

    template: template,

    initialize: function()
    {
      var renderOrders = _.debounce(this.renderOrders.bind(this), 1);
      var updateExecution = _.debounce(this.renderOrders.bind(this), 1);

      this.cache = {
        todo: {},
        done: {}
      };

      if (this.options.mode === 'todo')
      {
        this.listenTo(this.model.todo, 'reset', renderOrders);
        this.listenTo(this.model.done, 'add', function()
        {
          this.cacheOrders();
          updateExecution();
        });
        this.listenTo(this.model.done, 'change', updateExecution);
      }
      else
      {
        this.listenTo(this.model.done, 'reset add change', renderOrders);
      }
    },

    afterRender: function()
    {
      this.renderOrders();
      this.scheduleExtendLastItems();
    },

    cacheOrders: function()
    {
      var view = this;

      view.cache.todo = {};
      view.cache.done = {};

      view.model.todo.forEach(function(pso)
      {
        var orderNo = pso.get('orderId');

        if (!view.cache.todo[orderNo])
        {
          view.cache.todo[orderNo] = [];
        }

        view.cache.todo[orderNo].push(pso);
      });

      view.model.done.forEach(function(pso)
      {
        var orderNo = pso.get('orderId');

        if (!view.cache.done[orderNo])
        {
          view.cache.done[orderNo] = [];
        }

        view.cache.done[orderNo].push(pso);
      });
    },

    renderOrders: function()
    {
      this.cacheOrders();
      this.renderItems('order');
    },

    renderDowntimes: function()
    {
      this.renderItems('downtime');
    },

    renderItems: function(type)
    {
      var view = this;
      var items = view.model[view.options.mode];
      var shiftStartedAt = items.length ? getShiftStartInfo(items.at(0).get('startedAt')).startTime : 0;
      var now = Date.now();

      var html = items
        .map(function(item, i) { return view.renderItem(type, item.attributes, i, shiftStartedAt, now); })
        .join('');

      view.$el.find('.heff-timeline-item[data-type="' + type + '"]').remove();
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
        label: this.resolveLabel(type, item),
        execution: this.resolveExecution(type, item),
        width: width,
        left: left
      });
    },

    updateExecution: function()
    {
      var view = this;
      var items = view.model[view.options.mode];

      items.forEach(function(item, i)
      {
        var $item = view.$('.heff-timeline-item[data-type="order"][data-id="' + i + '"]');

        if ($item.length)
        {
          $item[0].dataset.execution = view.resolveExecution('order', item.toJSON());
        }
      });
    },

    resolveLabel: function(type, item)
    {
      if (type === 'order')
      {
        return item.orderId.match(/([0-9]{3})/g).join('<br>');
      }

      if (type === 'downtime')
      {
        return item.reason;
      }

      return '';
    },

    resolveExecution: function(type, item)
    {
      if (type !== 'order')
      {
        return '';
      }

      if (this.options.mode === 'todo')
      {
        var doneOrders = this.cache.done[item.orderId] || [];

        if (doneOrders.length === 0)
        {
          return '';
        }

        for (var doneI = doneOrders.length - 1; doneI >= 0; --doneI)
        {
          var doneOrder = doneOrders[doneI];

          if (!doneOrder.get('finishedAt'))
          {
            return 'current';
          }

          if (doneOrder.get('quantityDone') >= item.quantityDone)
          {
            return 'ok';
          }
        }

        return '';
      }

      if (!item.finishedAt)
      {
        return 'current';
      }

      var todoOrders = this.cache.todo[item.orderId] || [];

      if (todoOrders.length === 0)
      {
        return 'nok';
      }

      for (var todoI = 0; todoI < todoOrders.length; ++todoI)
      {
        var todoOrder = todoOrders[todoI];

        if (todoOrder.get('quantityDone') === item.quantityDone)
        {
          return 'ok';
        }
      }

      return '';
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

      var lastItem = items.last();

      this.$('.heff-timeline-item[data-type="' + type + '"][data-id="' + lastI + '"]').replaceWith(
        this.renderItem(type, lastItem, lastI)
      );
    },

    scheduleExtendLastItems: function()
    {
      if (this.options.mode === 'todo')
      {
        return;
      }

      clearTimeout(this.timers.extendLastItems);
      this.timers.extendLastItems = setTimeout(this.extendLastItems.bind(this), 60000);
    },

    extendLastItems: function()
    {
      this.extendLastItem('order');
    },

    extendLastItem: function(type)
    {
      this.scheduleExtendLastItems();

      var items = this.model[this.options.mode];
      var lastI = items.length - 1;
      var lastItem = items.last();

      if (!lastItem || lastItem.get('finishedAt'))
      {
        return;
      }

      var $item = this.$('.heff-timeline-item[data-type="' + type + '"][data-id="' + lastI + '"]');

      if (!$item.length)
      {
        return;
      }

      var startedAt = Date.parse(lastItem.get('startedAt'));
      var duration = Date.now() - startedAt;
      var width = duration / SHIFT_DURATION * 100;

      $item[0].style.width = width + '%';
    }

  });
});
