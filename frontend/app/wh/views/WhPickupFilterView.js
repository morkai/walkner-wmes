// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/orgUnits/util/setUpOrgUnitSelect2',
  'app/wh/templates/pickup/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  $,
  t,
  time,
  View,
  setUpMrpSelect2,
  setUpOrgUnitSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'change #-whStatuses': 'changeFilter',
      'change #-psStatuses': 'changeFilter',
      'change #-distStatuses': 'changeFilter',
      'change #-from': 'changeFilter',
      'change #-to': 'changeFilter',
      'change #-orders': 'scheduleChangeFilter',
      'input #-orders': 'scheduleChangeFilter',
      'change #-lines': 'changeFilter',
      'change #-mrps': 'changeFilter',
      'change input[name="filter"]': function()
      {
        this.toggleFilterVisibility();
        this.changeFilter();
      },
      'click #-useDarkerTheme': function()
      {
        this.plan.displayOptions.toggleDarkerThemeUse();
      }

    },

    nlsDomain: 'wh',

    initialize: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;

      this.listenTo(plan, 'change:loading', this.onLoadingChanged);
      this.listenTo(displayOptions, 'change:useDarkerTheme', this.updateToggles);
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    getTemplateData: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;
      var orders = displayOptions.get('orders').join(' ');
      var lines = displayOptions.get('lines').join(',');
      var mrps = displayOptions.get('mrps').join(',');
      var filter = 'orders';

      if (!orders.length)
      {
        if (lines.length)
        {
          filter = 'lines';
        }
        else if (mrps.length)
        {
          filter = 'mrps';
        }
      }

      return {
        whStatuses: displayOptions.get('whStatuses'),
        psStatuses: displayOptions.get('psStatuses'),
        distStatuses: displayOptions.get('distStatuses'),
        from: displayOptions.get('from'),
        to: displayOptions.get('to'),
        useDarkerTheme: displayOptions.isDarkerThemeUsed(),
        filter: filter,
        orders: orders,
        lines: lines,
        mrps: mrps
      };
    },

    afterRender: function()
    {
      this.$('.is-expandable').expandableSelect();

      this.setUpLinesFilter();
      this.setUpMrpsFilter();
      this.toggleFilterVisibility();
    },

    toggleFilterVisibility: function()
    {
      var filter = this.$('input[name="filter"]:checked').val();
      var $orders = this.$id('orders');
      var $lines = this.$id('lines');
      var $mrps = this.$id('mrps');

      if (filter === 'orders')
      {
        $lines.prev().css('display', 'none');
        $mrps.prev().css('display', 'none');
        $orders.removeClass('hidden').focus();
      }
      else if (filter === 'lines')
      {
        $orders.addClass('hidden');
        $mrps.prev().css('display', 'none');
        $lines.prev().css('display', '');
        $lines.select2('focus');
      }
      else if (filter === 'mrps')
      {
        $orders.addClass('hidden');
        $lines.prev().css('display', 'none');
        $mrps.prev().css('display', '');
        $mrps.select2('focus');
      }
    },

    setUpLinesFilter: function()
    {
      setUpOrgUnitSelect2(this.$id('lines'), {
        width: '698px',
        allowClear: true,
        multiple: true
      });
    },

    setUpMrpsFilter: function()
    {
      setUpMrpSelect2(this.$id('mrps'), {
        view: this,
        width: '698px'
      });
    },

    updateToggles: function()
    {
      this.$id('useDarkerTheme').toggleClass('active', this.plan.displayOptions.isDarkerThemeUsed());
    },

    scheduleChangeFilter: function()
    {
      clearTimeout(this.timers.changeFilter);
      this.timers.changeFilter = setTimeout(this.changeFilter.bind(this), 333);
    },

    changeFilter: function()
    {
      var view = this;

      clearTimeout(view.timers.changeFilter);

      var $whStatuses = view.$id('whStatuses');
      var $psStatuses = view.$id('psStatuses');
      var $distStatuses = view.$id('distStatuses');
      var data = {
        whStatuses: $whStatuses.val(),
        psStatuses: $psStatuses.val(),
        distStatuses: $distStatuses.val(),
        from: view.$id('from').val() || '06:00',
        to: view.$id('to').val() || '06:00',
        orders: [],
        lines: [],
        mrps: []
      };

      if (!data.whStatuses || data.whStatuses.length === $whStatuses[0].options.length)
      {
        data.whStatuses = [];
      }

      if (!data.psStatuses || data.psStatuses.length === $psStatuses[0].options.length)
      {
        data.psStatuses = [];
      }

      if (!data.distStatuses || data.distStatuses.length === $distStatuses[0].options.length)
      {
        data.distStatuses = [];
      }

      var filter = view.$('input[name="filter"]:checked').val();
      var orders = filter === 'orders';

      data[filter] = view.$id(filter).val().split(orders ? /[^0-9]+/ : ',').filter(function(v)
      {
        if (!v)
        {
          return false;
        }

        return orders ? /^[0-9]{9}$/.test(v) : true;
      });

      var displayOptions = {};

      ['whStatuses', 'psStatuses', 'distStatuses', 'from', 'to', 'orders', 'lines', 'mrps'].forEach(function(prop)
      {
        if (!_.isEqual(data[prop], view.plan.displayOptions.get(prop)))
        {
          displayOptions[prop] = data[prop];
        }
      });

      if (!_.isEmpty(displayOptions))
      {
        view.plan.displayOptions.set(displayOptions);
      }
    },

    onLoadingChanged: function()
    {
      var view = this;
      var loading = view.plan.get('loading');

      ['whStatuses', 'psStatuses', 'distStatuses', 'from', 'to', 'orders'].forEach(function(prop)
      {
        view.$id(prop).prop('disabled', loading);
      });

      view.$('input[name="filter"]').prop('disabled', loading);
      view.$id('lines').select2('enable', !loading);
      view.$id('mrps').select2('enable', !loading);
    }

  });
});
