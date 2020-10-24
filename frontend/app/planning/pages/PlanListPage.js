// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../views/PlanListView'
], function(
  $,
  time,
  View,
  bindLoadingMessage,
  PlanListView
) {
  'use strict';

  return View.extend({

    actions: [],

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:base'),
        {
          href: '#planning/plans?month=' + this.collection.month,
          label: time.getMoment(this.collection.month, 'YYYY-MM').format('MMMM YYYY'),
          template: function(breadcrumb)
          {
            return '<span class="paintShop-breadcrumb is-variable-width">'
              + '<a class="fa fa-chevron-left" data-action="prev"></a>'
              + '<a class="fa fa-chevron-right" data-action="next"></a>'
              + '<a href="' + breadcrumb.href + '" data-action="showPicker">' + breadcrumb.label + '</a></span>';
          }
        }
      ];
    },

    initialize: function()
    {
      bindLoadingMessage(this.collection, this);

      this.view = new PlanListView({
        collection: this.collection
      });

      this.listenTo(this.collection, 'change:month', this.onMonthChange);

      $(window)
        .on('mousedown.' + this.idPrefix, this.onMouseDown.bind(this))
        .on('keydown.' + this.idPrefix, this.onKeyDown.bind(this));

      $(document)
        .on('click.' + this.idPrefix, '.paintShop-breadcrumb', this.onBreadcrumbsClick.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      $(document).off('.' + this.idPrefix);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    onMonthChange: function()
    {
      this.broker.publish('router.navigate', {
        url: '/planning/plans?month=' + this.collection.month,
        trigger: false,
        replace: true
      });

      this.promised(this.collection.fetch({reset: true}));

      this.layout.setBreadcrumbs(this.breadcrumbs, this);
    },

    onBreadcrumbsClick: function(e)
    {
      if (e.target.tagName !== 'A')
      {
        return;
      }

      if (e.target.classList.contains('disabled'))
      {
        return false;
      }

      var action = e.target.dataset.action;

      if (action === 'showPicker')
      {
        this.showMonthPicker();
      }
      else if (action === 'prev')
      {
        this.collection.prevMonth();
      }
      else if (action === 'next')
      {
        this.collection.nextMonth();
      }

      return false;
    },

    onMouseDown: function(e)
    {
      if (!$(e.target).closest('.paintShop-breadcrumb').length)
      {
        this.hideMonthPicker();
      }
    },

    onKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.hideMonthPicker();
      }
    },

    showMonthPicker: function()
    {
      var page = this;
      var $showPicker = $('.paintShop-breadcrumb > a[data-action="showPicker"]');

      if ($showPicker.next().hasClass('popover'))
      {
        $showPicker.popover('destroy');

        return;
      }

      $showPicker.popover({
        html: true,
        trigger: 'manual',
        placement: 'bottom',
        className: 'planning-list-monthPicker',
        content: function()
        {
          return page.buildMonthPicker(page.collection.month);
        }
      });

      $showPicker.popover('show');

      $showPicker.data('bs.popover').tip().on('click', 'a[data-action]', function(e)
      {
        var action = e.currentTarget.dataset.action;

        switch (action)
        {
          case 'nextYear':
          case 'prevYear':
            var start = page.collection.month.split('-');

            start[0] = this.dataset.year;

            $(this).closest('.popover-content').html(page.buildMonthPicker(start.join('-'), page.collection.month));
            break;

          default:
            page.collection.setMonth(action);
            break;
        }
      });
    },

    buildMonthPicker: function(selected)
    {
      var selectedYear = +selected.substr(0, 4);
      var selectedMonth = +selected.substr(5) - 1;

      var html = '<table><tbody><tr><td>'
        + '<a href="javascript:void(0)" data-action="prevYear" data-year="' + (selectedYear - 1) + '">'
        + '<i class="fa fa-chevron-up"></i></a><td colspan="3">';

      var moment = time.getMoment(selected, 'YYYY-MM').startOf('year').subtract(2, 'years');

      for (var y = 0; y < 4; ++y)
      {
        html += '<tr><td>';

        if (moment.year() === selectedYear)
        {
          html += moment.year();
        }
        else
        {
          var mm = selectedMonth + 1;

          if (mm < 10)
          {
            mm = '0' + mm;
          }

          html += '<a href="javascript:void(0)" data-action="' + moment.year() + '-' + mm + '">'
            + moment.year()
            + '</a>';
        }

        for (var m = 0; m < 3; ++m)
        {
          html += '<td>';

          if (moment.month() === selectedMonth)
          {
            html += moment.format('MMMM');
          }
          else
          {
            html += '<a href="javascript:void(0)" data-action="' + selectedYear + '-' + moment.format('MM') + '">'
              + moment.format('MMMM')
              + '</a>';
          }

          moment.add(1, 'months');
        }

        moment.add(1, 'years');
      }

      html += '<tr><td>'
        + '<a href="javascript:void(0)" data-action="nextYear" data-year="' + (selectedYear + 1) + '">'
        + '<i class="fa fa-chevron-down"></i></a><td colspan="3">';

      html += '</table>';

      return html;
    },

    hideMonthPicker: function()
    {
      $('.paintShop-breadcrumb > a[data-action="showPicker"]').popover('destroy');
    }

  });
});
