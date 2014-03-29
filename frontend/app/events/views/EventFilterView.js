define([
  'underscore',
  'moment',
  'js2form',
  'reltime',
  'app/i18n',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/events/templates/filter',
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
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('eventFilter');
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        types: this.model.eventTypes.sort().toJSON()
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.toggleSeverity(formData.severity);

      this.$id('type').select2({
        width: 'resolve',
        allowClear: true
      });

      this.$id('user').select2({
        width: '200px',
        allowClear: true,
        minimumInputLength: 3,
        ajax: {
          cache: true,
          quietMillis: 500,
          url: function(term)
          {
            term = encodeURIComponent(term);

            return '/users?select(login)&sort(login)&limit(20)&regex(login,string:' + term + ')';
          },
          results: function(data, query)
          {
            var results = [
              {id: '$SYSTEM', text: t('events', 'FILTER_USER_SYSTEM')},
              {id: 'root', text: 'root'}
            ].filter(function(user)
            {
              return user.text.indexOf(query.term) !== -1;
            });

            return {
              results: results.concat((data.collection || []).map(function(user)
              {
                return {id: user.login, text: user.login};
              }))
            };
          }
        }
      });
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        type: '',
        user: '',
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit),
        severity: []
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        var property = term.args[0];

        switch (property)
        {
          case 'time':
            fixTimeRange.toFormData(formData, term, 'date+time');
            break;

          case 'type':
            formData.type = term.args[1];
            break;

          case 'user':
            formData.user = term.args[1] === null ? '$SYSTEM' : term.args[1];
            break;

          case 'severity':
            formData.severity =
              term.name === 'eq' ? [term.args[1]] : term.args[1];
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var timeRange = fixTimeRange.fromView(this);
      var selector = [];
      var type = this.$id('type').val().trim();
      var user = this.$id('user').val().trim();
      var severity = this.fixSeverity();

      if (type !== '')
      {
        selector.push({name: 'eq', args: ['type', type]});
      }

      if (user === '$SYSTEM')
      {
        selector.push({name: 'eq', args: ['user', null]});
      }
      else if (user !== '')
      {
        selector.push({name: 'eq', args: ['user.login', user]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['time', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['time', timeRange.to]});
      }

      if (severity.length === 1)
      {
        selector.push({name: 'eq', args: ['severity', severity[0]]});
      }
      else if (severity.length > 1)
      {
        selector.push({name: 'in', args: ['severity', severity]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10);
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    },

    fixSeverity: function()
    {
      var $allSeverity = this.$('.events-filter-form-severity');
      var $activeSeverity = $allSeverity.filter('.active');

      if ($activeSeverity.length === 0)
      {
        $allSeverity.addClass('active');
      }

      var selectedSeverity = $activeSeverity.map(function() { return this.value; }).get();

      return selectedSeverity.length === $allSeverity.length ? [] : selectedSeverity;
    },

    toggleSeverity: function(severities)
    {
      var $allSeverity = this.$('.events-filter-form-severity');

      if (severities.length === 0)
      {
        $allSeverity.addClass('active');
      }
      else
      {
        severities.forEach(function(severity)
        {
          $allSeverity.filter('[title="' + severity.toUpperCase() + '"]').addClass('active');
        });
      }
    }

  });
});
