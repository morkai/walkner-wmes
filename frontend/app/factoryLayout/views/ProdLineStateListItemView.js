// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/user',
  'app/viewport',
  'app/data/orgUnits',
  'app/data/downtimeReasons',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/orders/util/resolveProductName',
  'app/factoryLayout/templates/listItem',
  'app/prodShifts/views/ProdShiftTimelineView',
  'app/prodShifts/views/QuantitiesDoneChartView'
], function(
  _,
  $,
  time,
  currentUser,
  viewport,
  orgUnits,
  downtimeReasons,
  View,
  userInfoTemplate,
  resolveProductName,
  template,
  ProdShiftTimelineView,
  QuantitiesDoneChartView
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .factoryLayout-quantityDone-prop': function(e)
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
      },
      'click .btn[data-action="comment"]': function(e)
      {
        var view = this;
        var prodShift = view.model.get('prodShift');

        view.$id('comments').find('form.active').removeClass('active');

        if (!prodShift)
        {
          return;
        }

        var prodShiftId = prodShift.id;
        var $comment = view.$(e.currentTarget).closest('.factoryLayout-comment');
        var $form = $comment.find('form');
        var $textarea = $form.find('.form-control');
        var $submit = $form.find('.btn-primary');
        var i = +$comment[0].dataset.i;
        var comments = prodShift.get('comments') || [];
        var comment = comments[i] || {text: ''};
        var rect = $comment[0].getBoundingClientRect();

        $textarea.val(comment.text).css({
          width: (rect.width + 2) + 'px',
          height: Math.max(rect.height, 100) + 'px'
        });

        $form.addClass('active');
        $textarea.focus();

        $form.on('submit', function(e)
        {
          e.preventDefault();

          save();
        });

        $textarea.on('keydown', function(e)
        {
          if (e.key === 'Escape')
          {
            hide();
          }
          else if (e.key === 'Enter' && e.ctrlKey)
          {
            save();
          }
        });

        function hide()
        {
          $textarea.off();
          $form.off();
          $form.removeClass('active');
          $textarea.prop('disabled', false);
          $submit.prop('disabled', false);
        }

        function save()
        {
          var newText = $textarea.val().trim();

          if (newText === comment.text)
          {
            return hide();
          }

          viewport.msg.saving();

          $textarea.prop('disabled', true);
          $submit.prop('disabled', true);

          var req = view.ajax({
            method: 'PUT',
            url: '/prodShifts/' + prodShiftId,
            data: JSON.stringify({
              comment: {
                i: i,
                text: newText
              }
            })
          });

          req.fail(function()
          {
            viewport.msg.savingFailed();
          });

          req.done(function()
          {
            viewport.msg.saved();

            hide();
          });

          setTimeout(() => hide(), 1000);
        }
      }
    },

    initialize: function()
    {
      this.renderTimeline = _.debounce(this.renderTimeline.bind(this), 1);

      this.timelineView = null;
      this.quantitiesDoneChartView = null;

      var model = this.model;

      this.listenTo(model, 'change:online', this.onOnlineChanged);
      this.listenTo(model, 'change:state', this.onStateChanged);
      this.listenTo(model, 'change:extended', this.onExtendedChanged);
      this.listenTo(model, 'change:prodShift', this.onProdShiftChanged);
      this.listenTo(model, 'change:prodShiftOrders', this.onProdShiftOrdersChanged);
      this.listenTo(model, 'change:prodDowntimes', this.onProdDowntimesChanged);
      this.listenTo(model, 'change:taktTime', this.toggleTaktTime);
      this.listenTo(
        model,
        'change:plannedQuantityDone change:actualQuantityDone',
        _.debounce(this.onMetricsChanged.bind(this), 1)
      );
      this.listenTo(model.settings.production, 'change', this.onProductionSettingsChanged);
      this.listenTo(this.displayOptions, 'change', this.toggleVisibility);
    },

    destroy: function()
    {
      this.timelineView = null;
      this.quantitiesDoneChartView = null;
    },

    getTemplateData: function()
    {
      var classNames = [];

      if (!this.model.get('online'))
      {
        classNames.push('is-offline');
      }

      if (this.model.get('state'))
      {
        classNames.push('is-' + this.model.get('state'));

        if (this.model.isBreak())
        {
          classNames.push('is-break');
        }
      }

      if (this.model.get('extended'))
      {
        classNames.push('is-extended');
      }

      classNames.push(this.model.getShiftEfficiencyClassName());

      var workCenter = orgUnits.getParent(orgUnits.getByTypeAndId('prodLine', this.model.getProdLineId()));
      var prodFlow = workCenter ? orgUnits.getParent(workCenter) : null;
      var order = this.serializeOrder();
      var nc12 = this.serializeNc12();
      var downtime = this.serializeDowntime();

      return {
        canComment: currentUser.isAllowedTo('PROD_DATA:VIEW', 'FN:master', 'FN:leader'),
        classNames: classNames.join(' '),
        prodLine: this.model.getLabel(),
        prodFlow: prodFlow ? prodFlow.getLabel() : '?',
        workCenter: workCenter ? workCenter.getLabel() : '?',
        shift: this.serializeShift(),
        order: order,
        nc12: nc12,
        downtime: downtime,
        quantityDone: this.serializeQuantityDone(),
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
        text: time.format(prodShift.get('date'), 'L') + ', ' + this.t('core', 'SHIFT:' + prodShift.get('shift')),
        href: '#prodShifts/' + (this.displayOptions.isHistoryData() ? prodShift.id : this.model.id)
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

      var fullName = userInfo.label.match(/^(.*?)(?:\(.*?\))?$/)[1].trim();
      var parts = fullName.split(/\s+/);
      var firstName = parts.pop();
      var lastName = parts.join(' ');

      userInfo.label = lastName + (firstName.length ? (' ' + firstName.substring(0, 1) + '.') : '');
      userInfo.title = fullName;

      return userInfoTemplate(userInfo);
    },

    serializeOrder: function()
    {
      var lastOrder = this.model.get('prodShiftOrders').last();
      var value = '-';
      var title = '';

      if (lastOrder)
      {
        var orderNo = lastOrder.get('orderId');
        var operationNo = lastOrder.get('operationNo');
        var productName = resolveProductName(lastOrder.get('orderData'));

        value = orderNo;

        if (productName.length)
        {
          value += ': ' + productName;
          title = productName;
        }
        else
        {
          value += ', ' + operationNo;
        }
      }

      return {
        label: this.t(!lastOrder || lastOrder.get('finishedAt') ? 'prop:lastOrder' : 'prop:order'),
        value: value,
        title: title
      };
    },

    serializeNc12: function()
    {
      var lastOrder = this.model.get('prodShiftOrders').last();

      return {
        label: this.t(!lastOrder || lastOrder.get('finishedAt') ? 'prop:lastNc12' : 'prop:nc12'),
        value: lastOrder ? lastOrder.getNc12() : '-'
      };
    },

    serializeDowntime: function()
    {
      var lastDowntime = this.model.get('prodDowntimes').last();
      var downtimeReason = lastDowntime ? downtimeReasons.get(lastDowntime.get('reason')) : null;

      return {
        label: this.t(!lastDowntime || lastDowntime.get('finishedAt') ? 'prop:lastDowntime' : 'prop:downtime'),
        value: downtimeReason ? downtimeReason.getLabel() : (lastDowntime ? '?' : '-')
      };
    },

    serializeQuantityDone: function()
    {
      var actual = this.model.get('actualQuantityDone');
      var planned = this.model.get('plannedQuantityDone');

      return this.t('qty', {
        actual: actual === -1 ? '?' : actual.toLocaleString(),
        planned: planned === -1 ? '?' : planned.toLocaleString()
      });
    },

    serializeComments: function()
    {
      var prodShift = this.model.get('prodShift');
      var comments = prodShift && prodShift.get('comments') || [];
      var result = [];

      for (var i = 0; i < 8; ++i)
      {
        var comment = comments[i] || {
          date: null,
          user: null,
          text: ''
        };
        var v = 0;
        var title = '';

        if (comment.date)
        {
          var date = time.getMoment(comment.date);

          v = date.valueOf();
          title = comment.user.label + ' @ ' + date.format('L LT');
        }

        result.push({
          v: v.toString(),
          title: title,
          text: comment.text
        });
      }

      return result;
    },

    afterRender: function()
    {
      this.timelineView = new ProdShiftTimelineView({
        prodLineId: this.model.id,
        prodShift: this.model.get('prodShift'),
        prodShiftOrders: this.model.get('prodShiftOrders'),
        prodDowntimes: this.model.get('prodDowntimes'),
        whOrderStatuses: this.whOrderStatuses,
        editable: false,
        resizable: false,
        itemHeight: 40,
        calcWidth: this.calcWidth
      });

      this.setView('#-timeline', this.timelineView).render();

      this.listenTo(this.timelineView, 'chartRendered', this.onTimelineChartRendered);

      var hasProdShift = !!this.model.get('prodShift');

      if (hasProdShift)
      {
        this.$('.factoryLayout-quantityDone-prop').addClass('is-clickable');
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

      var chartView = this.quantitiesDoneChartView;

      if (chartView)
      {
        chartView.$el.css('width', this.calcWidth() + 'px');

        if (chartView.chart)
        {
          chartView.chart.reflow();
        }
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

      this.setView('#-quantitiesDone', this.quantitiesDoneChartView).render();

      this.updateComments(true);

      this.$id('quantitiesDone').removeClass('hidden');
      this.$id('comments').removeClass('hidden');
    },

    destroyQuantitiesDoneChart: function()
    {
      if (this.quantitiesDoneChartView !== null)
      {
        this.$id('comments').addClass('hidden');
        this.$id('quantitiesDone').addClass('hidden');

        this.quantitiesDoneChartView.remove();
        this.quantitiesDoneChartView = null;
      }
    },

    toggleTaktTime: function()
    {
      var effClassName = this.model.getShiftEfficiencyClassName();

      if (this.$el.hasClass(effClassName))
      {
        return;
      }

      this.$el.removeClass('is-eff-low is-eff-mid is-eff-high');

      if (effClassName)
      {
        this.$el.addClass(effClassName);
      }
    },

    updateComments: function(force)
    {
      var view = this;

      if (!force && view.$id('comments').hasClass('hidden'))
      {
        return;
      }

      var comments = view.serializeComments();

      view.$('.factoryLayout-comment').each(function(i, el)
      {
        var comment = comments[i];

        if (comment.v === el.dataset.v)
        {
          return;
        }

        el.dataset.v = comment.v;
        el.title = comment.title;

        var p = el.querySelector('p');

        if (comment.text)
        {
          p.textContent = comment.text;
        }
        else
        {
          p.innerHTML = '<i>' + view.t('comments:empty') + '</i>';
        }
      });
    },

    toggleVisibility: function()
    {
      this.$el.toggle(this.displayOptions.isVisible(this.model));
    },

    onProductionSettingsChanged: function(setting)
    {
      if (/taktTime/.test(setting.id))
      {
        this.toggleTaktTime();
      }
    },

    onOnlineChanged: function()
    {
      this.$el.toggleClass('is-offline', !this.model.get('online'));
      this.toggleVisibility();
    },

    onStateChanged: function()
    {
      this.$el.removeClass('is-idle is-working is-downtime is-break');

      if (this.model.get('state'))
      {
        this.$el.addClass('is-' + this.model.get('state'));
        this.$el.toggleClass('is-break', this.model.isBreak());
      }

      this.toggleVisibility();
    },

    onExtendedChanged: function()
    {
      this.$el.toggleClass('is-extended', this.model.get('extended'));
    },

    onProdShiftChanged: function()
    {
      var view = this;

      view.$id('shift').html(view.serializeShift().text);

      ['master', 'leader', 'operator'].forEach(function(type)
      {
        view.$id(type).html(view.serializePersonnel(type));
      });

      var hasProdShift = !!view.model.get('prodShift');

      if (!hasProdShift)
      {
        view.destroyQuantitiesDoneChart();
      }

      view.$('.factoryLayout-quantityDone-prop').toggleClass('is-clickable', hasProdShift);

      view.updateComments(false);
    },

    onProdShiftOrdersChanged: function(options)
    {
      var order = this.serializeOrder();
      var nc12 = this.serializeNc12();

      this.$id('orderLabel').html(order.label);
      this.$id('orderValue').html(order.value);
      this.$id('nc12Label').html(nc12.label);
      this.$id('nc12Value').html(nc12.value);

      if (options && options.reset)
      {
        this.renderTimeline();
      }
    },

    onProdDowntimesChanged: function(options)
    {
      var downtime = this.serializeDowntime();

      this.$id('downtimeLabel').html(downtime.label);
      this.$id('downtimeValue').html(downtime.value);

      if (options && options.reset)
      {
        this.renderTimeline();
      }
    },

    onMetricsChanged: function()
    {
      this.$id('quantityDone').html(this.serializeQuantityDone());
    },

    onTimelineChartRendered: function()
    {
      this.toggleTaktTime();
    }

  });
});
