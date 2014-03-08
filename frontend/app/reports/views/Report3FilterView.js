define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/time',
  'app/data/divisions',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/reports/templates/report3Filter'
], function(
  _,
  js2form,
  t,
  time,
  divisions,
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

        this.toggleDivisions();
        this.toggleSubdivisionType();
        this.changeFilter();
      },
      'click a[data-range]': function(e)
      {
        /*jshint -W015*/

        var fromMoment = time.getMoment();
        var toMoment;
        var interval = 'day';

        switch (e.target.getAttribute('data-range'))
        {
          case 'currentMonth':
            fromMoment.date(1);
            toMoment = fromMoment.clone().add('months', 1);
            break;

          case 'prevMonth':
            fromMoment.date(1).subtract('months', 1);
            toMoment = fromMoment.clone().add('months', 1);
            break;

          case 'currentWeek':
            fromMoment.weekday(0);
            toMoment = fromMoment.clone().add('days', 7);
            break;

          case 'prevWeek':
            fromMoment.weekday(0).subtract('days', 7);
            toMoment = fromMoment.clone().add('days', 7);
            break;

          case 'today':
            toMoment = fromMoment.clone().add('days', 1);
            break;

          case 'yesterday':
            toMoment = fromMoment.clone();
            fromMoment.subtract('days', 1);
            break;
        }

        this.$id('from').val(fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(toMoment.format('YYYY-MM-DD'));
        this.$('.btn[data-interval=' + interval + ']').click();
        this.$('.filter-form').submit();
      },
      'change input[name="divisions[]"]': function()
      {
        var divisions = [];
        var $divisions = this.$('input[name="divisions[]"]');

        $divisions.filter(':checked').each(function()
        {
          divisions.push(this.value);
        });

        this.model.set('divisions', divisions.length === $divisions.length ? [] : divisions);
      },
      'change input[name="subdivisionType"]': function()
      {
        var subdivisionTypes = [];
        var $subdivisionTypes = this.$('input[name="subdivisionType"]');

        $subdivisionTypes.filter(':checked').each(function()
        {
          subdivisionTypes.push(this.value);
        });

        this.model.set(
          'subdivisionType',
          subdivisionTypes.length === $subdivisionTypes.length ? null : subdivisionTypes[0]
        );
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('report3Filter');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        divisions: divisions
          .filter(function(division) { return division.get('type') === 'prod'; })
          .sort(function(a, b) { return a.getLabel().localeCompare(b.getLabel()); })
          .map(function(division)
          {
            return {
              id: division.id,
              label: division.id,
              title: division.get('description')
            };
          })
      };
    },

    afterRender: function()
    {
      var formData = this.serializeFormData();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.$('input[name=interval]:checked').closest('.btn').addClass('active');
      this.$('input[name="divisions[]"]:checked').closest('.btn').addClass('active');
      this.$('input[name=subdivisionType]:checked').closest('.btn').addClass('active');

      this.toggleSubdivisionType();
      this.toggleDivisions();
    },

    toggleSubdivisionType: function()
    {
      var $subdivisionTypes = this.$id('subdivisionTypes');

      if (!$subdivisionTypes.find('> .active').length)
      {
        $subdivisionTypes.find('> .btn').addClass('active');
        $subdivisionTypes.find('input').attr('checked', true);
      }

      return $subdivisionTypes;
    },

    toggleDivisions: function()
    {
      var $divisions = this.$id('divisions');

      if (!$divisions.find('> .active').length)
      {
        $divisions.find('> .btn').addClass('active');
        $divisions.find('input').attr('checked', true);
      }

      return $divisions;
    },

    serializeFormData: function()
    {
      return {
        interval: this.model.get('interval'),
        from: time.format(+this.model.get('from'), 'YYYY-MM-DD'),
        to: time.format(+this.model.get('to'), 'YYYY-MM-DD'),
        majorMalfunction: this.model.get('majorMalfunction'),
        divisions: this.model.get('divisions'),
        subdivisionType: this.model.get('subdivisionType')
      };
    },

    changeFilter: function()
    {
      var query = {
        _rnd: Math.random(),
        from: null,
        to: null,
        interval: this.$id('intervals').find('.active > input').val(),
        majorMalfunction: parseFloat(this.$id('majorMalfunction').val()) || 1.5
      };

      var timeRange = fixTimeRange.fromView(this);

      query.from = timeRange.from || this.getFromMomentForSelectedInterval().valueOf();
      query.to = timeRange.to || Date.now();

      this.$id('from').val(time.format(query.from, 'YYYY-MM-DD'));
      this.$id('to').val(time.format(query.to, 'YYYY-MM-DD'));

      this.model.set(query, {reset: true});
    },

    getSelectedInterval: function()
    {
      return this.$id('intervals').find('.active').attr('data-interval');
    },

    getFromMomentForSelectedInterval: function()
    {
      /*jshint -W015*/

      var fromMoment = time.getMoment().minutes(0).seconds(0).milliseconds(0);

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
