// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/planning/templates/planFilter'
], function(
  _,
  $,
  t,
  time,
  View,
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
      'click #-wrapLists': function()
      {
        this.plan.displayOptions.toggleListWrapping();
      },
      'click #-useLatestOrderData': function()
      {
        this.plan.displayOptions.toggleLatestOrderDataUse();
      }

    },

    initialize: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;

      this.listenTo(plan, 'change:loading', this.onLoadingChanged);
      this.listenTo(displayOptions, 'change:minDate change:maxDate', this.onMinMaxDateChanged);
      this.listenTo(displayOptions, 'change:wrapLists', this.updateToggles);
      this.listenTo(displayOptions, 'change:useLatestOrderData', this.updateToggles);
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
        wrapLists: displayOptions.isListWrappingEnabled(),
        useLatestOrderData: displayOptions.isLatestOrderDataUsed()
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

    recountStats: function()
    {
      var stats = {
        manHours: {
          todo: 0,
          done: 0,
          late: 0
        },
        quantity: {
          todo: 0,
          done: 0,
          late: 0
        }
      };

      $('.planning-mrp-stats-bd').each(function()
      {
        $(this).find('td').each(function()
        {
          var value = this.dataset.value;

          if (value > 0)
          {
            stats[this.dataset.group][this.dataset.subgroup] += parseFloat(value);
          }
        });
      });

      this.$('.planning-mrp-stats-bd td').each(function()
      {
        this.textContent = stats[this.dataset.group][this.dataset.subgroup].toLocaleString();
      });
    },

    updateToggles: function()
    {
      var displayOptions = this.plan.displayOptions;

      this.$id('wrapLists').toggleClass('active', !displayOptions.isListWrappingEnabled());
      this.$id('useLatestOrderData').toggleClass('active', displayOptions.isLatestOrderDataUsed());
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

    onMinMaxDateChanged: function()
    {
      this.$id('date').prop('min', this.plan.displayOptions.get('minDate'));
      this.$id('date').prop('max', this.plan.displayOptions.get('maxDate'));
    }

  });
});
