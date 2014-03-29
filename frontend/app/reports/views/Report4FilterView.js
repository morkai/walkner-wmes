define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/time',
  'app/data/divisions',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/reports/templates/report4Filter',
  './prepareDateRange'
], function(
  _,
  js2form,
  t,
  time,
  divisions,
  View,
  fixTimeRange,
  filterTemplate,
  prepareDateRange
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
      'click a[data-range]': function(e)
      {
        var dateRange = prepareDateRange(e.target.getAttribute('data-range'));

        this.$id('from').val(dateRange.fromMoment.format('YYYY-MM-DD'));
        this.$id('to').val(dateRange.toMoment.format('YYYY-MM-DD'));
        this.$('.btn[data-interval="' + dateRange.interval + '"]').click();
        this.$('.filter-form').submit();
      },
      'change input[name=mode]': function()
      {
        this.toggleMode();
        this.toggleSubmit();
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('report4Filter');
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
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

      this.$('input[name=interval]:checked').closest('.btn').addClass('active');
      this.$('input[name=shift]:checked').closest('.btn').addClass('active');

      var $users = this.$id('users');

      $users.select2({
        width: 550,
        allowClear: true,
        multiple: true,
        minimumInputLength: 3,
        ajax: {
          cache: true,
          quietMillis: 500,
          url: function(term)
          {
            var property = /^[0-9]+$/.test(term) ? 'personellId' : 'lastName';

            return '/users'
              + '?select(personellId,lastName,firstName)'
              + '&sort(lastName,firstName)'
              + '&limit(20)'
              + '&regex(' + property + ',' + encodeURIComponent('^' + term) + ',i)';
          },
          results: function(data)
          {
            return {
              results: (data.collection || []).map(function(user)
              {
                return {
                  id: user.personellId,
                  text: user.lastName + ' ' + user.firstName
                };
              })
            };
          }
        }
      });
      $users.select2('data', this.model.getUsersForSelect2());
      $users.on('change', this.toggleSubmit.bind(this));

      this.toggleShift();
      this.toggleMode();
      this.toggleSubmit();
    },

    toggleShift: function()
    {
      var $shift = this.$id('shift');

      if (!$shift.find('> .active').length)
      {
        $shift.find('> .btn').addClass('active');
        $shift.find('input').attr('checked', true);
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
        shift: this.model.get('shift')
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
