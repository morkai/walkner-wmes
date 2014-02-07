define([
  'underscore',
  'js2form',
  'moment',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/reports/templates/report1Filter'
], function(
  _,
  js2form,
  moment,
  t,
  time,
  View,
  fixTimeRange,
  filterTemplate
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      },
      'change input[name=mode]': 'onModeChange',
      'click .btn[data-range]': function(e)
      {
        /*jshint -W015*/

        var fromMoment = moment().minutes(0).seconds(0).milliseconds(0);
        var toMoment;
        var interval;

        switch (e.target.getAttribute('data-range'))
        {
          case 'month':
            fromMoment.date(1).hours(6);
            toMoment = fromMoment.clone().add('months', 1);
            interval = 'week';
            break;

          case 'week':
            fromMoment.weekday(0).hours(6);
            toMoment = fromMoment.clone().add('days', 7);
            interval = 'day';
            break;

          case 'day':
            fromMoment.hours(6);
            toMoment = fromMoment.clone().add('days', 1);
            interval = 'shift';
            break;

          case 'shift':
            var hours = fromMoment.hours();

            if (hours >= 6 && hours < 14)
            {
              fromMoment.hours(6);
            }
            else if (hours >= 14 && hours < 22)
            {
              fromMoment.hours(14);
            }
            else
            {
              fromMoment.hours(22);

              if (hours < 6)
              {
                fromMoment.subtract('days', 1);
              }
            }

            toMoment = fromMoment.clone().add('hours', 8);
            interval = 'hour';
            break;
        }

        this.$id('from-date').val(fromMoment.format('YYYY-MM-DD'));
        this.$id('from-time').val(fromMoment.format('HH:mm'));
        this.$id('to-date').val(toMoment.format('YYYY-MM-DD'));
        this.$id('to-time').val(toMoment.format('HH:mm'));
        this.$id('mode-date').click();
        this.$('.btn[data-interval=' + interval + ']').click();
        this.$('.filter-form').submit();
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('report1Filter');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      var formData = this.serializeFormData();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.$('[name=interval]:checked').closest('.btn').addClass('active');
      this.$('[name=subdivisionType]:checked').closest('.btn').addClass('active');

      this.toggleSubdivisionType();
      this.onModeChange();
    },

    toggleSubdivisionType: function()
    {
      var $subdivisionTypes = this.$('.reports-1-filter-subdivisionTypes');

      if (!$subdivisionTypes.find('> .active').length)
      {
        $subdivisionTypes.find('> .btn').addClass('active');
      }

      return $subdivisionTypes;
    },

    onModeChange: function()
    {
      var online = this.getSelectedMode() === 'online';

      this.$('.filter-dateRange .form-control').attr('disabled', online);

      var $intervals = this.$('.reports-1-filter-intervals > .btn');

      $intervals
        .filter('[data-interval=month], [data-interval=week], [data-interval=day]')
        [online ? 'addClass' : 'removeClass']('disabled');

      if (online)
      {
        var $interval = $intervals.filter('.active.disabled');

        if ($interval.length)
        {
          $intervals.filter('[data-interval=hour]').click();
        }
      }
      else
      {
        this.$id('from').select();
      }
    },

    serializeFormData: function()
    {
      var formData = {
        mode: 'online',
        interval: this.model.get('interval'),
        subdivisionType: this.model.get('subdivisionType')
      };

      formData['from-date'] = time.format(this.model.get('from'), 'YYYY-MM-DD');
      formData['from-time'] = time.format(this.model.get('from'), 'HH:mm');
      formData['to-date'] = time.format(this.model.get('to'), 'YYYY-MM-DD');
      formData['to-time'] = time.format(this.model.get('to'), 'HH:mm');

      if (formData.from && formData.to)
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
        interval: this.$('.reports-1-filter-intervals > .active > input').val(),
        subdivisionType: null
      };

      var $subdivisionTypes = this.toggleSubdivisionType().find('> .active');

      if ($subdivisionTypes.length === 1)
      {
        query.subdivisionType = $subdivisionTypes.find('input').val();
      }

      var fromMoment;
      var toMoment;

      if (this.getSelectedMode() === 'date')
      {
        var timeRange = fixTimeRange.fromView(this, {defaultTime: '06:00'});

        query.from = timeRange.from || this.getFromMomentForSelectedInterval().valueOf();
        query.to = timeRange.to || Date.now();

        fromMoment = moment(query.from);
        toMoment = moment(query.to);
      }
      else
      {
        fromMoment = this.model.getFirstShiftMoment();
        toMoment = fromMoment.clone().add('days', 1);
      }

      this.$id('from-date').val(fromMoment.format('YYYY-MM-DD'));
      this.$id('from-time').val(fromMoment.format('HH:mm'));
      this.$id('to-date').val(toMoment.format('YYYY-MM-DD'));
      this.$id('to-time').val(toMoment.format('HH:mm'));

      this.model.set(query);
    },

    getSelectedMode: function()
    {
      return this.$('input[name=mode]:checked').val();
    },

    getSelectedInterval: function()
    {
      return this.$('.reports-1-filter-intervals > .active').attr('data-interval');
    },

    getFromMomentForSelectedInterval: function()
    {
      /*jshint -W015*/

      var fromMoment = moment().minutes(0).seconds(0).milliseconds(0);

      switch (this.getSelectedInterval())
      {
        case 'month':
          return fromMoment.date(1).hours(6);

        case 'week':
          return fromMoment.day(1).hours(6);

        default:
          return fromMoment.hour(6);
      }
    }

  });
});
