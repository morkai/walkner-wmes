// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/util/pageActions',
  'app/data/clipboard',
  'app/data/orgUnits',
  'app/mrpControllers/util/setUpMrpSelect2',
  './ExportStatsDialogView',
  './ExportTransportDialogView',
  'app/planning/templates/planFilter'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  pageActions,
  clipboard,
  orgUnits,
  setUpMrpSelect2,
  ExportStatsDialogView,
  ExportTransportDialogView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'input #-date': 'changeFilter',
      'change #-date': 'changeFilter',
      'change #-mrps': function()
      {
        this.$('input[name="division"]:checked').prop('checked', false).parent().removeClass('active');
        this.changeFilter();
      },
      'change input[name="division"]': function()
      {
        this.$id('mrps').select2('data', []);
        this.changeFilter();
      },
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
        this.copyOrderList(+e.currentTarget.dataset.shift, e.pageX, e.pageY);
      },
      'click #-exportStats': function()
      {
        viewport.showDialog(
          new ExportStatsDialogView({model: this.plan}),
          this.t('stats:export:title')
        );
      },
      'click #-exportTransport': function()
      {
        viewport.showDialog(
          new ExportTransportDialogView({model: this.plan}),
          this.t('transport:export:title')
        );
      },

      'mouseup #-division > .btn': function(e)
      {
        var view = this;
        var labelEl = e.currentTarget;
        var radioEl = labelEl.firstElementChild;

        if (radioEl.checked)
        {
          setTimeout(function()
          {
            labelEl.classList.remove('active');
            radioEl.checked = false;

            view.$id('mrps').select2('data', []);
            view.changeFilter();
          }, 1);
        }
      }

    },

    modelProperty: 'plan',

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

    getTemplateData: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;

      return {
        date: plan.id,
        version: plan.settings.getVersion(),
        divisions: Object.keys(displayOptions.get('activeMrps')).sort(),
        division: displayOptions.get('division'),
        mrps: displayOptions.get('mrps'),
        minDate: displayOptions.get('minDate'),
        maxDate: displayOptions.get('maxDate'),
        lineOrdersList: displayOptions.isLineOrdersListEnabled(),
        useDarkerTheme: displayOptions.isDarkerThemeUsed(),
        showToggles: this.options.toggles !== false,
        showStats: this.options.stats !== false
      };
    },

    afterRender: function()
    {
      setUpMrpSelect2(this.$id('mrps'), {
        width: '350px',
        placeholder: this.t('filter:mrps:placeholder'),
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
        clipboard.showTooltip({
          target: view.$id('copyOrderList')[0],
          text: view.t('toolbar:copyOrderList:success')
        });
      });
    },

    getStats: function()
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
          percent: 0,
          1: {
            plan: 0,
            done: 0,
            percent: 0
          },
          2: {
            plan: 0,
            done: 0,
            percent: 0
          },
          3: {
            plan: 0,
            done: 0,
            percent: 0
          }
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
              stats.execution[shiftNo].plan += parseInt(dataset.plan, 10);
              stats.execution[shiftNo].done += parseInt(dataset.done, 10);
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
        var execution = stats.execution[shiftNo];

        execution.percent = execution.plan
          ? Math.round(execution.done / execution.plan * 100)
          : 100;
      }

      return stats;
    },

    recountStats: function()
    {
      var stats = this.getStats();

      this.$('td[data-group]').each(function()
      {
        var group = this.dataset.group.split('.');
        var stat = stats[group[0]];

        if (group.length > 1)
        {
          stat = stat[group[1]];
        }

        this.textContent = stat[this.dataset.subgroup].toLocaleString();
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
      var mrps = this.$id('mrps').val().split(',').filter(function(v) { return v.length > 0; });
      var displayOptions = {
        division: this.$('input[name="division"]:checked').val() || null
      };

      if (!_.isEqual(mrps, this.plan.displayOptions.get('mrps')))
      {
        displayOptions.mrps = mrps;
      }

      this.plan.displayOptions.set(displayOptions);

      if (dateEl.checkValidity()
        && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)
        && date !== this.plan.id)
      {
        this.plan.set('_id', date);
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
