// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/data/orgUnits',
  'app/data/downtimeReasons',
  'app/core/View',
  'app/factoryLayout/templates/listItem',
  'app/prodShifts/views/ProdShiftTimelineView'
], function(
  _,
  t,
  time,
  orgUnits,
  downtimeReasons,
  View,
  template,
  ProdShiftTimelineView
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

    },

    initialize: function()
    {
      this.timelineView = null;

      this.listenTo(this.model, 'change:online', this.onOnlineChanged);
      this.listenTo(this.model, 'change:state', this.onStateChanged);
      this.listenTo(this.model, 'change:prodShift', this.onProdShiftChanged);
      this.listenTo(this.model, 'change:prodShiftOrders', this.onProdShiftOrdersChanged);
      this.listenTo(this.model, 'change:prodDowntimes', this.onProdDowntimesChanged);
      this.listenTo(
        this.model,
        'change:plannedQuantityDone change:actualQuantityDone',
        _.debounce(this.onMetricsChanged.bind(this), 1)
      );
    },

    destroy: function()
    {
      this.timelineView = null;
    },

    serialize: function()
    {
      var classNames = [];

      if (!this.model.get('online'))
      {
        classNames.push('is-offline');
      }

      if (this.model.get('state'))
      {
        classNames.push('is-' + this.model.get('state'));
      }

      var workCenter = orgUnits.getParent(orgUnits.getByTypeAndId('prodLine', this.model.id));
      var prodFlow = workCenter ? orgUnits.getParent(workCenter) : null;
      var order = this.serializeOrder();
      var downtime = this.serializeDowntime();

      return {
        classNames: classNames.join(' '),
        prodLine: this.model.getLabel(),
        prodFlow: prodFlow ? prodFlow.getLabel() : '?',
        workCenter: workCenter ? workCenter.getLabel() : '?',
        shift: this.serializeShift(),
        order: order,
        downtime: downtime,
        quantitiesDone: this.serializeQuantitiesDone()
      };
    },

    serializeShift: function()
    {
      var prodShift = this.model.get('prodShift');

      if (!prodShift)
      {
        return '?';
      }

      return time.format(prodShift.get('date'), 'YYYY-MM-DD') + ', ' + t('core', 'SHIFT:' + prodShift.get('shift'));
    },

    serializeOrder: function()
    {
      var lastOrder = this.model.get('prodShiftOrders').last();

      return {
        label: t('factoryLayout', !lastOrder || lastOrder.get('finishedAt') ? 'prop:lastOrder' : 'prop:order'),
        value: lastOrder ? lastOrder.getLabel(false) : '-'
      };
    },

    serializeDowntime: function()
    {
      var lastDowntime = this.model.get('prodDowntimes').last();
      var downtimeReason = lastDowntime ? downtimeReasons.get(lastDowntime.get('reason')) : null;

      return {
        label: t(
          'factoryLayout',
          !lastDowntime || lastDowntime.get('finishedAt') ? 'prop:lastDowntime' : 'prop:downtime'
        ),
        value: downtimeReason ? downtimeReason.getLabel() : (lastDowntime ? '?' : '-')
      };
    },

    serializeQuantitiesDone: function()
    {
      var actual = this.model.get('actualQuantityDone');
      var planned = this.model.get('plannedQuantityDone');

      return t('factoryLayout', 'qty', {
        actual: actual === -1 ? '?' : actual.toLocaleString(),
        planned: planned === -1 ? '?' : planned.toLocaleString()
      });
    },

    beforeRender: function()
    {

    },

    afterRender: function()
    {
      this.timelineView = new ProdShiftTimelineView({
        prodShift: this.model.get('prodShift'),
        prodShiftOrders: this.model.get('prodShiftOrders'),
        prodDowntimes: this.model.get('prodDowntimes'),
        editable: false,
        resizable: false,
        itemHeight: 40,
        calcWidth: function()
        {
          return window.innerWidth - 20;
        }
      });

      this.setView('.factoryLayout-timeline-container', this.timelineView).render();
    },

    resize: function()
    {
      this.timelineView.onWindowResize();
    },

    onOnlineChanged: function()
    {
      this.$el.toggleClass('is-offline', !this.model.get('online'));
    },

    onStateChanged: function()
    {
      this.$el.removeClass('is-idle is-working is-downtime');

      if (this.model.get('state'))
      {
        this.$el.addClass('is-' + this.model.get('state'));
      }
    },

    onProdShiftChanged: function()
    {
      this.$('[role=shift]').html(this.serializeShift());
    },

    onProdShiftOrdersChanged: function()
    {
      var order = this.serializeOrder();

      this.$('[role=orderLabel]').html(order.label);
      this.$('[role=orderValue]').html(order.value);
    },

    onProdDowntimesChanged: function()
    {
      var downtime = this.serializeDowntime();

      this.$('[role=downtimeLabel]').html(downtime.label);
      this.$('[role=downtimeValue]').html(downtime.value);
    },

    onMetricsChanged: function()
    {
      this.$('[role=quantitiesDone]').html(this.serializeQuantitiesDone());
    }

  });
});
