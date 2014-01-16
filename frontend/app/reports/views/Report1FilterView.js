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
      'change input[name=mode]': 'onModeChange'
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
        from: time.format(this.model.get('from'), 'YYYY-MM-DD HH:mm:ss'),
        to: time.format(this.model.get('to'), 'YYYY-MM-DD HH:mm:ss'),
        mode: 'online',
        interval: this.model.get('interval'),
        subdivisionType: this.model.get('subdivisionType')
      };

      if (formData.from && formData.to)
      {
        formData.mode = 'date';
      }

      return formData;
    },

    changeFilter: function()
    {
      var query = {
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

      var format = 'YYYY-MM-DD HH:mm:ss';
      var fromMoment;
      var toMoment;

      if (this.getSelectedMode() === 'date')
      {
        fromMoment = moment(this.$id('from').val());
        toMoment = moment(this.$id('to').val());

        if (!fromMoment.isValid())
        {
          fromMoment = this.getFromMomentForSelectedInterval();
        }

        if (!toMoment.isValid())
        {
          toMoment = moment();
        }

        query.from = fromMoment.toISOString();
        query.to = toMoment.toISOString();
      }
      else
      {
        fromMoment = this.model.getFirstShiftMoment();
        toMoment = fromMoment.clone().add('days', 1);
      }

      this.$id('from').val(fromMoment.format(format));
      this.$id('to').val(toMoment.format(format));

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
