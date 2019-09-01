// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/core/util/buttonGroup',
  '../WiringOrderCollection',
  'app/wmes-wiring/templates/filter'
], function(
  _,
  $,
  View,
  buttonGroup,
  WiringOrderCollection,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click #-status .btn': function(e)
      {
        if (!e.ctrlKey)
        {
          return;
        }

        this.orders.setStatusFilter([e.currentTarget.firstElementChild.value]);

        return false;
      },
      'mousedown #-status .btn': function(e)
      {
        if (e.button !== 2)
        {
          return;
        }

        this.orders.setStatusFilter([e.currentTarget.firstElementChild.value]);

        return false;
      },
      'contextmenu #-status .btn': function()
      {
        return false;
      },
      'change input[name="status[]"]': function()
      {
        var statuses = buttonGroup.getValue(this.$id('status'));

        this.orders.setStatusFilter(statuses);

        return false;
      },
      'click #-mrp .active': function()
      {
        this.orders.setMrpFilter('all');

        return false;
      },
      'change input[name="mrp[]"]': function()
      {
        this.orders.setMrpFilter(this.$('input[name="mrp[]"]:checked').val());

        return false;
      }
    },

    modelProperty: 'orders',

    initialize: function()
    {
      this.keyBuffer = '';

      var toggleMrpFilter = _.debounce(this.toggleFilter.bind(this, 'mrp'), 1);

      this.listenTo(this.orders, 'filter:status', _.debounce(this.toggleFilter.bind(this, 'status'), 1));
      this.listenTo(this.orders, 'filter:mrp', function()
      {
        toggleMrpFilter();
        this.recountStats();
      });
      this.listenTo(this.orders, 'reset', this.render);
      this.listenTo(this.orders, 'totalsRecounted', this.recountStats);

      $('body').on('keyup.' + this.idPrefix, this.onKeyUp.bind(this));
    },

    destroy: function()
    {
      $('body').off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        statuses: WiringOrderCollection.STATUSES,
        mrps: this.orders.getMrps(),
        filters: this.orders.filters,
        stats: this.orders.getStats()
      };
    },

    afterRender: function()
    {
      this.toggleFilter('status');
      this.toggleFilter('mrp');
    },

    toggleFilter: function(filter)
    {
      var $group = this.$id(filter);

      filter = this.orders.filters[filter];

      $group.find('.btn').each(function()
      {
        var value = this.firstElementChild.value;
        var active = Array.isArray(filter) ? _.includes(filter, value) : value === filter;

        this.classList.toggle('active', active);
        this.firstElementChild.checked = active;
      });
    },

    onKeyUp: function(e)
    {
      var view = this;
      var key = e.key.toUpperCase();

      clearTimeout(view.timers.handleKeyBuffer);

      if (!/^[A-Z0-9]$/.test(key))
      {
        view.keyBuffer = '';

        return;
      }

      view.keyBuffer += key;

      var mrps = view.orders.getMrps();

      if (_.includes(mrps, view.keyBuffer))
      {
        if (view.keyBuffer !== view.orders.filters.mrp)
        {
          view.orders.setMrpFilter(view.keyBuffer);
        }

        view.keyBuffer = '';

        return;
      }

      view.timers.handleKeyBuffer = setTimeout(function() { view.keyBuffer = ''; }, 1000);
    },

    recountStats: function()
    {
      var view = this;

      view.$('.wiring-filter-status-stats').each(function()
      {
        var status = this.parentNode.dataset.status;
        var mrp = view.orders.filters.mrp;
        var mrpStats = view.orders.totalQuantities[mrp];

        this.textContent = mrpStats && mrpStats[status] || 0;
      });

      view.$('.wiring-filter-mrp-stats').each(function()
      {
        var mrp = this.dataset.mrp;
        var mrpStats = view.orders.totalQuantities[mrp];

        this.textContent = mrpStats ? mrpStats.remaining : 0;
      });
    }

  });
});
