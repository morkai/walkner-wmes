// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/data/divisions',
  'app/core/View',
  'app/core/util/forms/dateTimeRange',
  'app/reports/templates/3/filter'
], function(
  js2form,
  time,
  divisions,
  View,
  dateTimeRange,
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

        this.toggleDivisions();
        this.toggleSubdivisionType();
        this.changeFilter();
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
      'change input[name="subdivisionType[]"]': function()
      {
        var subdivisionTypes = [];
        var $subdivisionTypes = this.$('input[name="subdivisionType[]"]');

        $subdivisionTypes.filter(':checked').each(function()
        {
          subdivisionTypes.push(this.value);
        });

        var all = subdivisionTypes.length === $subdivisionTypes.length || !subdivisionTypes.length;

        this.model.set('subdivisionType', all ? null : subdivisionTypes);
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        divisions: divisions
          .filter(function(division) { return division.get('type') === 'prod'; })
          .sort(function(a, b)
          {
            return a.getLabel().localeCompare(b.getLabel(), undefined, {numeric: true, ignorePunctuation: true});
          })
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

      js2form(this.el, formData);

      this.$('input[name="interval"]:checked').closest('.btn').addClass('active');
      this.$('input[name="divisions[]"]:checked').closest('.btn').addClass('active');
      this.$('input[name="subdivisionType[]"]:checked').closest('.btn').addClass('active');

      this.toggleSubdivisionType();
      this.toggleDivisions();
    },

    toggleSubdivisionType: function()
    {
      var $subdivisionTypes = this.$id('subdivisionTypes');

      if (!$subdivisionTypes.find('> .active').length)
      {
        $subdivisionTypes.find('> .btn').addClass('active');
        $subdivisionTypes.find('input').prop('checked', true);
      }

      return $subdivisionTypes;
    },

    toggleDivisions: function()
    {
      var $divisions = this.$id('divisions');

      if (!$divisions.find('> .active').length)
      {
        $divisions.find('> .btn').addClass('active');
        $divisions.find('input').prop('checked', true);
      }

      return $divisions;
    },

    serializeFormData: function()
    {
      return {
        interval: this.model.get('interval'),
        'from-date': time.format(+this.model.get('from'), 'YYYY-MM-DD'),
        'to-date': time.format(+this.model.get('to'), 'YYYY-MM-DD'),
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

      var range = dateTimeRange.serialize(this);

      var fromMoment = range.from || this.getFromMomentForSelectedInterval();
      var toMoment = range.to || time.getMoment();

      query.from = fromMoment.valueOf();
      query.to = toMoment.valueOf();

      this.$id('from-date').val(fromMoment.format('YYYY-MM-DD'));
      this.$id('to-date').val(toMoment.format('YYYY-MM-DD'));

      this.model.set(query, {reset: true});
    },

    getSelectedInterval: function()
    {
      return this.$id('intervals').find('.active').attr('data-interval');
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
    }

  });
});
