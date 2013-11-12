define([
  'underscore',
  'moment',
  'js2form',
  'reltime',
  'app/i18n',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/orders/templates/filter',
  'i18n!app/nls/events',
  'select2'
], function(
  _,
  moment,
  js2form,
  reltime,
  t,
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
      'change input[name=from]': function(e)
      {
        var $to = this.$('input[name=to]');

        if ($to.attr('data-changed') !== 'true')
        {
          $to.val(e.target.value);
        }
      },
      'change input[name=to]': function(e)
      {
        e.target.setAttribute('data-changed', 'true');
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('orderFilter');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.$('#' + this.idPrefix + '-type').select2({
        width: 'resolve',
        allowClear: true
      });
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        _id: '',
        nc12: '',
        date: 'finish',
        from: '',
        to: '',
        user: '',
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit),
        statuses: []
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        var property = term.args[0];

        switch (property)
        {
          case 'startDate':
          case 'finishDate':
            formData[term.name === 'ge' ? 'from' : 'to'] =
              moment(term.args[1]).format('YYYY-MM-DD');
            break;

          case '_id':
          case 'nc12':
            formData[property] = term.args[1].replace(/[^0-9]/g, '');
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var timeRange = fixTimeRange(
        this.$('#' + this.idPrefix + '-from'),
        this.$('#' + this.idPrefix + '-to'),
        'YYYY-MM-DD'
      );
      var selector = [];
      var date = this.$('[name=date]:checked').val() + 'Date';

      this.serializeRegexTerm(selector, '_id', 9);
      this.serializeRegexTerm(selector, 'nc12', 12);

      if (timeRange.from !== -1)
      {
        selector.push({name: 'ge', args: [date, timeRange.from]});
      }

      if (timeRange.to !== -1)
      {
        selector.push({name: 'le', args: [date, timeRange.to]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$('#' + this.idPrefix + '-limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    },

    serializeRegexTerm: function(selector, property, maxLength)
    {
      var $el = this.$('#' + this.idPrefix + '-' + property);
      var value = $el.val().trim().replace(/[^0-9]/g, '');

      $el.val(value);

      if (value.length === maxLength)
      {
        selector.push({name: 'eq', args: [property, value]});
      }
      else if (value.length > 0)
      {
        selector.push({name: 'regex', args: [property, value]});
      }
    }

  });
});
