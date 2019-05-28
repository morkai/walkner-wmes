// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/wh/templates/planFilter'
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
      'change #-from': 'changeFilter',
      'change #-to': 'changeFilter',
      'click #-useDarkerTheme': function()
      {
        this.plan.displayOptions.toggleDarkerThemeUse();
      }

    },

    initialize: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;

      this.listenTo(plan, 'change:loading', this.onLoadingChanged);
      this.listenTo(plan, 'change:_id', this.onDateChanged);
      this.listenTo(displayOptions, 'change:minDate change:maxDate', this.onMinMaxDateChanged);
      this.listenTo(displayOptions, 'change:useDarkerTheme', this.updateToggles);
    },

    getTemplateData: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;

      return {
        date: plan.id,
        minDate: displayOptions.get('minDate'),
        maxDate: displayOptions.get('maxDate'),
        from: displayOptions.get('from'),
        to: displayOptions.get('to'),
        useDarkerTheme: displayOptions.isDarkerThemeUsed()
      };
    },

    updateToggles: function()
    {
      this.$id('useDarkerTheme').toggleClass('active', this.plan.displayOptions.isDarkerThemeUsed());
    },

    changeFilter: function()
    {
      var view = this;
      var date = view.$id('date').val();
      var data = {
        from: view.$id('from').val() || '06:00',
        to: view.$id('to').val() || '06:00'
      };

      var displayOptions = {};

      ['from', 'to'].forEach(function(prop)
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

      if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date) && date !== view.plan.id)
      {
        view.plan.set('_id', date);
      }
    },

    onLoadingChanged: function()
    {
      var loading = this.plan.get('loading');

      this.$id('date').prop('disabled', loading);
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
