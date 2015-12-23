// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/reports/templates/1/filter',
  '../util/prepareDateRange'
], function(
  js2form,
  time,
  View,
  fixTimeRange,
  template,
  prepareDateRange
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      },
      'change input[name=mode]': 'onModeChange',
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target, true);

        this.$id('from-date').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('from-time').val(dateRange.fromMoment.format('HH:mm'));
        this.$id('to-date').val(dateRange.toMoment.format('YYYY-MM-DD'));
        this.$id('to-time').val(dateRange.toMoment.format('HH:mm'));
        this.$id('mode-date').click();
        this.$('.btn[data-interval="' + dateRange.interval + '"]').click();
        this.$('.filter-form').submit();
      },
      'click #-showDisplayOptions': function()
      {
        this.trigger('showDisplayOptions');
      }
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
      var $subdivisionTypes = this.$id('subdivisionTypes');

      if (!$subdivisionTypes.find('> .active').length)
      {
        $subdivisionTypes.find('> .btn').addClass('active');
        $subdivisionTypes.find('input').prop('checked', true);
      }

      return $subdivisionTypes;
    },

    onModeChange: function()
    {
      var view = this;
      var online = this.getSelectedMode() === 'online';

      this.$('.filter-dateRange .form-control').prop('disabled', online);

      var $intervals = this.$id('intervals').find('.btn');

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

        fromMoment = time.getMoment(query.from);
        toMoment = time.getMoment(query.to);
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
      return this.$('input[name=mode]:checked').val();
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
