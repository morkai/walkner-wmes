// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/util/forms/dateTimeRange',
  'app/reports/views/OrgUnitPickerView',
  'app/reports/templates/1/filter'
], function(
  _,
  js2form,
  t,
  time,
  viewport,
  View,
  dateTimeRange,
  OrgUnitPickerView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'submit': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      },
      'change input[name="mode"]': 'onModeChange',
      'click #-showDisplayOptions': function()
      {
        this.trigger('showDisplayOptions');
      },
      'click #-ignoredOrgUnits': 'showIgnoredOrgUnitsDialog',
      'change input[name="interval"]': 'checkDateIntervalValidity',
      'change input[type="date"]': 'checkDateIntervalValidity'
    },

    initialize: function()
    {
      this.ignoredOrgUnits = this.model.get('ignoredOrgUnits');
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      this.$('input[name="interval"]:checked').closest('.btn').addClass('active');

      this.toggleIgnoredOrgUnits();
      this.onModeChange();
    },

    toggleIgnoredOrgUnits: function()
    {
      this.$id('ignoredOrgUnits').toggleClass('active', !_.isEmpty(this.ignoredOrgUnits));
    },

    onModeChange: function()
    {
      var view = this;
      var online = view.getSelectedMode() === 'online';

      view.$('.dateTimeRange .form-control').prop('disabled', online);

      var $intervals = view.$id('intervals').find('.btn');

      $intervals.each(function()
      {
        var interval = this.getAttribute('data-interval');
        var disabled = online && interval !== 'shift' && interval !== 'hour';

        view.$(this).toggleClass('disabled', disabled);
      });

      if (online)
      {
        var $interval = $intervals.filter('.active.disabled');

        if ($interval.length)
        {
          $intervals.filter('[data-interval="hour"]').click();
        }
      }
      else
      {
        view.$id('from').select();
      }
    },

    serializeFormData: function()
    {
      var formData = {
        mode: 'online',
        interval: this.model.get('interval')
      };

      var from = parseInt(this.model.get('from'), 10);
      var to = parseInt(this.model.get('to'), 10);

      formData['from-date'] = time.format(from, 'YYYY-MM-DD');
      formData['from-time'] = time.format(from, 'HH:mm');
      formData['to-date'] = time.format(to, 'YYYY-MM-DD');
      formData['to-time'] = time.format(to, 'HH:mm');

      if (from || to)
      {
        formData.mode = 'date';
      }

      return formData;
    },

    changeFilter: function()
    {
      var query = {
        rnd: Math.random(),
        from: null,
        to: null,
        interval: this.$id('intervals').find('.active > input').val(),
        ignoredOrgUnits: _.assign({}, this.ignoredOrgUnits)
      };

      var fromMoment;
      var toMoment;

      if (this.getSelectedMode() === 'date')
      {
        var timeRange = dateTimeRange.serialize(this);

        fromMoment = timeRange.from || this.getFromMomentForSelectedInterval();
        toMoment = timeRange.to || time.getMoment();

        query.from = fromMoment.valueOf();
        query.to = toMoment.valueOf();
      }
      else
      {
        fromMoment = this.model.getFirstShiftMoment();
        toMoment = fromMoment.clone().add(1, 'days');
      }

      this.$id('from-date').val(fromMoment.format('YYYY-MM-DD'));
      this.$id('from-time').val(fromMoment.format('HH:mm'));
      this.$id('to-date').val(toMoment.format('YYYY-MM-DD'));
      this.$id('to-time').val(toMoment.format('HH:mm'));

      this.model.set(query);
    },

    getSelectedMode: function()
    {
      return this.$('input[name="mode"]:checked').val();
    },

    getSelectedInterval: function()
    {
      return this.$('input[name="interval"]:checked').val();
    },

    getFromMomentForSelectedInterval: function()
    {
      var fromMoment = time.getMoment().startOf('hour');

      switch (this.getSelectedInterval())
      {
        case 'month':
          return fromMoment.date(1).hours(6);

        case 'week':
          return fromMoment.day(1).hours(6);

        default:
          return fromMoment.hour(6);
      }
    },

    showIgnoredOrgUnitsDialog: function()
    {
      var filterView = this;
      var dialogView = new OrgUnitPickerView({
        model: this.ignoredOrgUnits
      });

      dialogView.once('picked', function(ignoredOrgUnits)
      {
        filterView.ignoredOrgUnits = ignoredOrgUnits;
        filterView.toggleIgnoredOrgUnits();

        viewport.closeDialog();
      });

      viewport.showDialog(dialogView, t('reports', 'filter:ignoredOrgUnits'));
    }

  });
});
