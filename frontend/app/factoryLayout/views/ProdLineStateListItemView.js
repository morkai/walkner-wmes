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
  'app/core/templates/userInfo',
  'app/factoryLayout/templates/listItem',
  'app/prodShifts/views/ProdShiftTimelineView',
  'app/prodShifts/views/QuantitiesDoneChartView'
], function(
  _,
  t,
  time,
  orgUnits,
  downtimeReasons,
  View,
  renderUserInfo,
  template,
  ProdShiftTimelineView,
  QuantitiesDoneChartView
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .factoryLayout-quantitiesDone-prop': function(e)
      {
        if (e.currentTarget.classList.contains('is-clickable'))
        {
          this.toggleQuantitiesDoneChart();
        }
      },
      'mouseup .factoryLayout-prodLineListItem-prodLine': function(e)
      {
        if (e.button === 2)
        {
          return;
        }

        var shift = this.serializeShift();

        if (!shift.href)
        {
          return;
        }

        if (e.button === 1)
        {
          window.open(shift.href);
        }
        else
        {
          this.broker.publish('router.navigate', {
            url: shift.href,
            trigger: true,
            replace: false
          });
        }

        return false;
      }
    },

    initialize: function()
    {
      this.renderTimeline = _.debounce(this.renderTimeline.bind(this), 1);

      this.timelineView = null;
      this.quantitiesDoneChartView = null;

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
      this.listenTo(this.displayOptions, 'change', this.toggleVisibility);
    },

    destroy: function()
    {
      this.timelineView = null;
      this.quantitiesDoneChartView = null;
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

      var workCenter = orgUnits.getParent(orgUnits.getByTypeAndId('prodLine', this.model.getProdLineId()));
      var prodFlow = workCenter ? orgUnits.getParent(workCenter) : null;
      var order = this.serializeOrder();
      var nc12 = this.serializeNc12();
      var downtime = this.serializeDowntime();

      return {
        classNames: classNames.join(' '),
        prodLine: this.model.getLabel(),
        prodFlow: prodFlow ? prodFlow.getLabel() : '?',
        workCenter: workCenter ? workCenter.getLabel() : '?',
        shift: this.serializeShift(),
        order: order,
        nc12: nc12,
        downtime: downtime,
        quantitiesDone: this.serializeQuantitiesDone(),
        master: this.serializePersonnel('master'),
        leader: this.serializePersonnel('leader'),
        operator: this.serializePersonnel('operator')
      };
    },

    serializeShift: function()
    {
      var prodShift = this.model.get('prodShift');

      if (!prodShift)
      {
        return {
          text: '?',
          href: null
        };
      }

      return {
        text: time.format(prodShift.get('date'), 'YYYY-MM-DD') + ', ' + t('core', 'SHIFT:' + prodShift.get('shift')),
        href: '#prodShifts/' + prodShift.id
      };
    },

    serializePersonnel: function(type)
    {
      var prodShift = this.model.get('prodShift');

      if (!prodShift)
      {
        return '-';
      }

      var userInfo = prodShift.get(type);

      if (!userInfo)
      {
        return '-';
      }

      userInfo.label = userInfo.label.match(/^(.*?)(?:\(.*?\))?$/)[1].trim();

      return renderUserInfo({userInfo: userInfo});
    },

    serializeOrder: function()
    {
      var lastOrder = this.model.get('prodShiftOrders').last();

      return {
        label: t('factoryLayout', !lastOrder || lastOrder.get('finishedAt') ? 'prop:lastOrder' : 'prop:order'),
        value: lastOrder ? lastOrder.getLabel(false) : '-'
      };
    },

    serializeNc12: function()
    {
      var lastOrder = this.model.get('prodShiftOrders').last();

      return {
        label: t('factoryLayout', !lastOrder || lastOrder.get('finishedAt') ? 'prop:lastNc12' : 'prop:nc12'),
        value: lastOrder ? lastOrder.getNc12() : '-'
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

    afterRender: function()
    {
      this.timelineView = new ProdShiftTimelineView({
        prodShift: this.model.get('prodShift'),
        prodShiftOrders: this.model.get('prodShiftOrders'),
        prodDowntimes: this.model.get('prodDowntimes'),
        editable: false,
        resizable: false,
        itemHeight: 40,
        calcWidth: this.calcWidth
      });

      this.setView('.factoryLayout-timeline-container', this.timelineView).render();

      var hasProdShift = !!this.model.get('prodShift');

      if (hasProdShift)
      {
        this.$('.factoryLayout-quantitiesDone-prop').addClass('is-clickable');
      }

      this.$el.toggleClass('has-prodShift', hasProdShift);

      if (this.quantitiesDoneChartView)
      {
        this.quantitiesDoneChartView = null;
        this.toggleQuantitiesDoneChart();
      }

      this.toggleVisibility();
    },

    calcWidth: function()
    {
      return window.innerWidth - 20;
    },

    renderTimeline: function()
    {
      if (this.timelineView)
      {
        this.timelineView.render();
      }
    },

    resize: function()
    {
      this.timelineView.onWindowResize();

      if (this.quantitiesDoneChartView)
      {
        this.quantitiesDoneChartView.$el.css('width', this.calcWidth() + 'px');
        this.quantitiesDoneChartView.chart.reflow();
      }
    },

    toggleQuantitiesDoneChart: function()
    {
      if (this.quantitiesDoneChartView === null)
      {
        this.renderQuantitiesDoneChart();
      }
      else
      {
        this.destroyQuantitiesDoneChart();
      }
    },

    renderQuantitiesDoneChart: function()
    {
      var prodShift = this.model.get('prodShift');

      if (!prodShift)
      {
        return;
      }

      this.quantitiesDoneChartView = new QuantitiesDoneChartView({
        model: this.model.get('prodShift'),
        height: 220,
        reflow: false,
        showTitle: false,
        showLegend: false
      });

      this.setView('.factoryLayout-quantitiesDone-container', this.quantitiesDoneChartView).render();
      this.quantitiesDoneChartView.$el.parent().show();
    },

    destroyQuantitiesDoneChart: function()
    {
      if (this.quantitiesDoneChartView !== null)
      {
        this.quantitiesDoneChartView.$el.parent().hide();
        this.quantitiesDoneChartView.remove();
        this.quantitiesDoneChartView = null;
      }
    },

    toggleVisibility: function()
    {
      this.$el.toggle(this.displayOptions.isVisible(this.model));
    },

    onOnlineChanged: function()
    {
      this.$el.toggleClass('is-offline', !this.model.get('online'));
      this.toggleVisibility();
    },

    onStateChanged: function()
    {
      this.$el.removeClass('is-idle is-working is-downtime');

      if (this.model.get('state'))
      {
        this.$el.addClass('is-' + this.model.get('state'));
      }

      this.toggleVisibility();
    },

    onProdShiftChanged: function()
    {
      this.$('[role=shift]').html(this.serializeShift());

      ['master', 'leader', 'operator'].forEach(function(type)
      {
        this.$('[role=' + type + ']').html(this.serializePersonnel(type));
      }, this);

      var hasProdShift = !!this.model.get('prodShift');

      if (!hasProdShift)
      {
        this.destroyQuantitiesDoneChart();
      }

      this.$('.factoryLayout-quantitiesDone-prop').toggleClass('is-clickable', hasProdShift);
    },

    onProdShiftOrdersChanged: function(options)
    {
      var order = this.serializeOrder();
      var nc12 = this.serializeNc12();

      this.$('[role=orderLabel]').html(order.label);
      this.$('[role=orderValue]').html(order.value);
      this.$('[role=nc12Label]').html(nc12.label);
      this.$('[role=nc12Value]').html(nc12.value);

      if (options && options.reset)
      {
        this.renderTimeline();
      }
    },

    onProdDowntimesChanged: function(options)
    {
      var downtime = this.serializeDowntime();

      this.$('[role=downtimeLabel]').html(downtime.label);
      this.$('[role=downtimeValue]').html(downtime.value);

      if (options && options.reset)
      {
        this.renderTimeline();
      }
    },

    onMetricsChanged: function()
    {
      this.$('[role=quantitiesDone]').html(this.serializeQuantitiesDone());
    }

  });
});
