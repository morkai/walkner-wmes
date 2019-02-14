// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/data/clipboard',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/planning/templates/planFilter'
], function(
  _,
  $,
  t,
  time,
  View,
  clipboard,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'input #-date': 'changeFilter',
      'change #-date': 'changeFilter',
      'change #-mrps': 'changeFilter',
      'click #-lineOrdersList': function()
      {
        this.plan.displayOptions.toggleLineOrdersList();
      },
      'click #-useDarkerTheme': function()
      {
        this.plan.displayOptions.toggleDarkerThemeUse();
      },
      'click a[role="copyOrderList"]': function(e)
      {
        this.copyOrderList(+e.currentTarget.dataset.shift);
      }

    },

    initialize: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;

      this.listenTo(plan, 'change:loading', this.onLoadingChanged);
      this.listenTo(plan, 'change:_id', this.onDateChanged);
      this.listenTo(displayOptions, 'change:minDate change:maxDate', this.onMinMaxDateChanged);
      this.listenTo(
        displayOptions,
        'change:lineOrdersList change:useDarkerTheme',
        this.updateToggles
      );
    },

    serialize: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;

      return _.assign({
        idPrefix: this.idPrefix,
        date: plan.id,
        mrps: displayOptions.get('mrps'),
        minDate: displayOptions.get('minDate'),
        maxDate: displayOptions.get('maxDate'),
        lineOrdersList: displayOptions.isLineOrdersListEnabled(),
        useDarkerTheme: displayOptions.isDarkerThemeUsed(),
        showToggles: this.options.toggles !== false,
        showStats: this.options.stats !== false
      });
    },

    afterRender: function()
    {
      setUpMrpSelect2(this.$id('mrps'), {
        width: '600px',
        placeholder: t('planning', 'filter:mrps:placeholder'),
        sortable: true,
        own: true,
        view: this
      });
    },

    copyOrderList: function(shiftNo)
    {
      var view = this;
      var mrps = {};

      $('.planning-mrp[data-id]').each(function() { mrps[this.dataset.id] = true; });

      var orderList = view.plan.getOrderList(mrps, shiftNo);

      clipboard.copy(function(clipboardData)
      {
        if (!clipboardData)
        {
          return;
        }

        clipboardData.setData('text/plain', orderList.join('\r\n'));
        clipboardData.setData('text/html', '<ul><li>' + orderList.join('</li><li>') + '</li></ul>');

        var $btn = view.$id('copyOrderList').tooltip({
          container: view.el,
          trigger: 'manual',
          placement: 'bottom',
          title: t('planning', 'toolbar:copyOrderList:success')
        });

        $btn.tooltip('show').data('bs.tooltip').tip().addClass('result success');

        if (view.timers.hideTooltip)
        {
          clearTimeout(view.timers.hideTooltip);
        }

        view.timers.hideTooltip = setTimeout(function() { $btn.tooltip('destroy'); }, 1337);
      });
    },

    recountStats: function()
    {
      var stats = {
        manHours: {
          todo: 0,
          late: 0,
          plan: 0,
          remaining: 0
        },
        quantity: {
          todo: 0,
          late: 0,
          plan: 0,
          remaining: 0
        },
        execution: {
          plan: 0,
          done: 0,
          percent: 0
        },
        execution1: {
          plan: 0,
          done: 0,
          percent: 0
        },
        execution2: {
          plan: 0,
          done: 0,
          percent: 0
        },
        execution3: {
          plan: 0,
          done: 0,
          percent: 0
        },
        orders: {
          todo: 0,
          late: 0,
          plan: 0,
          remaining: 0
        }
      };

      $('.planning-mrp-stats-bd').each(function()
      {
        $(this).find('td').each(function()
        {
          var dataset = this.dataset;

          if (dataset.plan)
          {
            var shiftNo = dataset.shiftNo;

            if (shiftNo)
            {
              stats['execution' + shiftNo].plan += parseInt(dataset.plan, 10);
              stats['execution' + shiftNo].done += parseInt(dataset.done, 10);
            }
            else
            {
              stats.execution.plan += parseInt(dataset.plan, 10);
              stats.execution.done += parseInt(dataset.done, 10);
            }

            return;
          }

          var value = dataset.value;

          if (value > 0)
          {
            stats[dataset.group][dataset.subgroup] += parseFloat(value);
          }
        });
      });

      stats.execution.percent = stats.execution.plan
        ? Math.round(stats.execution.done / stats.execution.plan * 100)
        : 0;

      for (var shiftNo = 1; shiftNo <= 3; ++shiftNo)
      {
        var execution = stats['execution' + shiftNo];

        execution.percent = execution.plan
          ? Math.round(execution.done / execution.plan * 100)
          : 100;
      }

      this.$('.planning-mrp-stats-bd td').each(function()
      {
        this.textContent = stats[this.dataset.group][this.dataset.subgroup].toLocaleString();
      });
    },

    updateToggles: function()
    {
      if (this.options.toggles === false)
      {
        return;
      }

      var displayOptions = this.plan.displayOptions;

      this.$id('lineOrdersList').toggleClass('active', displayOptions.isLineOrdersListEnabled());
      this.$id('useDarkerTheme').toggleClass('active', displayOptions.isDarkerThemeUsed());
    },

    changeFilter: function()
    {
      var dateEl = this.$id('date')[0];
      var date = dateEl.value;
      var newFilter = {
        mrps: this.$id('mrps').val().split(',').filter(function(v) { return v.length > 0; })
      };

      if (dateEl.checkValidity() && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date))
      {
        newFilter.date = date;
      }

      if (!_.isEqual(newFilter.mrps, this.plan.displayOptions.get('mrps')))
      {
        this.plan.displayOptions.set('mrps', newFilter.mrps);
      }

      if (newFilter.date && newFilter.date !== this.plan.id)
      {
        this.plan.set('_id', newFilter.date);
      }
    },

    onLoadingChanged: function()
    {
      var loading = this.plan.get('loading');

      this.$id('date').prop('disabled', loading);
      this.$id('mrps').select2('enable', !loading);
    },

    onDateChanged: function()
    {
      this.$id('date').val(this.plan.id);
    },

    onMinMaxDateChanged: function()
    {
      this.$id('date')
        .prop('min', this.plan.displayOptions.get('minDate'))
        .prop('max', this.plan.displayOptions.get('maxDate'));
    }

  });
});
