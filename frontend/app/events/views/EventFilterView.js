// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/fixTimeRange',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/events/templates/filter'
], function(
  fixTimeRange,
  FilterView,
  setUpUsersSelect2,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: function()
    {
      return {
        type: '',
        user: '',
        severity: []
      };
    },

    termToForm: {
      'time': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date+time');
      },
      'type': function(propertyName, term, formData)
      {
        formData.type = term.args[1];
      },
      'user._id': function(propertyName, term, formData)
      {
        formData.user = term.args[1] === null ? '$SYSTEM' : term.args[1];
      },
      'severity': function(propertyName, term, formData)
      {
        formData.severity = term.name === 'eq' ? [term.args[1]] : term.args[1];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleSeverity(this.formData.severity);

      this.$id('type').select2({
        width: 300,
        allowClear: true,
        data: this.model.eventTypes.map(function(eventType) { return eventType.toSelect2Option(); })
      });

      setUpUsersSelect2(this.$id('user'), {
        view: this,
        width: 300
      });
    },

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this);
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
    },

    fixSeverity: function()
    {
      var $allSeverity = this.$id('severity').find('.btn');
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
      var $allSeverity = this.$id('severity').find('.btn');

      if (severities.length === 0)
      {
        $allSeverity.addClass('active');
      }
      else
      {
        severities.forEach(function(severity)
        {
          $allSeverity.filter('[value=' + severity + ']').addClass('active');
        });
      }
    }

  });
});
