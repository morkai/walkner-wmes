// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'js2form',
  'app/i18n',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/events/templates/filter',
  'select2'
], function(
  _,
  js2form,
  t,
  View,
  fixTimeRange,
  setUpUsersSelect2,
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

      setUpUsersSelect2(this.$id('user'), {
        width: 300
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

          case 'user._id':
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
      var user = this.$id('user').select2('data');
      var severity = this.fixSeverity();

      if (type !== '')
      {
        selector.push({name: 'eq', args: ['type', type]});
      }

      if (user)
      {
        selector.push({name: 'eq', args: ['user._id', user.id === '$SYSTEM' ? null : user.id]});
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
