// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'js2form',
  'app/time',
  'app/data/divisions',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/core/util/buttonGroup',
  'app/users/util/setUpUserSelect2',
  'app/reports/templates/4/filter',
  '../util/prepareDateRange'
], function(
  js2form,
  time,
  divisions,
  View,
  fixTimeRange,
  buttonGroup,
  setUpUsersSelect2,
  template,
  prepareDateRange
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        this.toggleDivisions();
        this.changeFilter();
      },
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target);

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
        this.$('.btn[data-interval="' + dateRange.interval + '"]').click();
        this.$el.submit();
      },
      'change input[name=mode]': function()
      {
        this.toggleMode();
        this.toggleSubmit();
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
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        divisions: divisions
          .filter(function(division)
          {
            return division.get('type') === 'prod';
          })
          .sort(function(a, b)
          {
            return a.getLabel().localeCompare(b.getLabel());
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

      this.$('input[name=interval]:checked').closest('.btn').addClass('active');
      this.$('input[name=shift]:checked').closest('.btn').addClass('active');

      var $users = setUpUsersSelect2(this.$id('users'), {
        width: 550,
        multiple: true
      });
      $users.select2('data', this.model.getUsersForSelect2());
      $users.on('change', this.toggleSubmit.bind(this));

      this.toggleShift();
      this.toggleMode();
      this.toggleDivisions();
      this.toggleSubmit();
    },

    toggleShift: function()
    {
      var $shift = this.$id('shift');

      if (!$shift.find('> .active').length)
      {
        $shift.find('> .btn').addClass('active');
        $shift.find('input').prop('checked', true);
      }

      return $shift;
    },

    toggleMode: function()
    {
      var mode = this.getSelectedMode();

      if (mode === 'shift')
      {
        this.$id('users').select2('container').hide();
        this.$id('shift').show();
      }
      else
      {
        this.$id('shift').hide();
        this.$id('users').select2('container').show();
      }
    },

    toggleDivisions: function()
    {
      var $divisions = this.$id('divisions');

      buttonGroup.toggle($divisions);

      if (!$divisions.find('> .active').length)
      {
        $divisions.find('> .btn').addClass('active');
        $divisions.find('input').prop('checked', true);
      }
    },

    toggleSubmit: function()
    {
      this.$('.filter-actions button').prop(
        'disabled',
        this.getSelectedMode() !== 'shift' && !this.$id('users').select2('data').length
      );
    },

    serializeFormData: function()
    {
      return {
        interval: this.model.get('interval'),
        from: time.format(+this.model.get('from'), 'YYYY-MM-DD'),
        to: time.format(+this.model.get('to'), 'YYYY-MM-DD'),
        mode: this.model.get('mode'),
        shift: this.model.get('shift'),
        divisions: this.model.get('divisions')
      };
    },

    changeFilter: function()
    {
      var query = {
        _rnd: Math.random(),
        from: null,
        to: null,
        interval: this.getSelectedInterval(),
        mode: this.getSelectedMode()
      };

      var timeRange = fixTimeRange.fromView(this);

      query.from = timeRange.from || this.getFromMomentForSelectedInterval().valueOf();
      query.to = timeRange.to || Date.now();

      this.$id('from').val(time.format(query.from, 'YYYY-MM-DD'));
      this.$id('to').val(time.format(query.to, 'YYYY-MM-DD'));

      if (query.mode === 'shift')
      {
        query.shift = parseInt(this.$('input[name=shift]:checked').val(), 10);
      }
      else
      {
        query[query.mode] = this.$id('users').select2('val');
      }

      this.model.set(query, {reset: true});
    },

    getSelectedInterval: function()
    {
      return this.$id('intervals').find('.active').attr('data-interval');
    },

    getSelectedMode: function()
    {
      return this.$('input[name=mode]:checked').val();
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
