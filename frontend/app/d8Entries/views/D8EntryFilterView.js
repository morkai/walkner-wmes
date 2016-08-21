// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/d8Entries/dictionaries',
  'app/d8Entries/templates/filter'
], function(
  _,
  time,
  FilterView,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.extend({
      'change input[name="userType"]': 'toggleUserSelect2',
      'keyup select': function(e)
      {
        if (e.keyCode === 27)
        {
          e.target.selectedIndex = -1;

          return false;
        }
      },
      'dblclick select': function(e)
      {
        e.target.selectedIndex = -1;
      }
    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        status: [].concat(dictionaries.statuses),
        division: null,
        entrySource: null,
        problemSource: null,
        userType: 'others',
        user: null,
        from: '',
        to: ''
      };
    },

    termToForm: {
      'division': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'owner.id': function(propertyName, term, formData)
      {
        formData.userType = 'owner';
        formData.user = term.args[1];
      },
      'observers.user.id': function(propertyName, term, formData)
      {
        if (term.args[1] === 'mine')
        {
          formData.userType = 'mine';
          formData.user = null;
        }
        else if (term.args[1] === 'unseen')
        {
          formData.userType = 'unseen';
          formData.user = null;
        }
        else
        {
          formData.userType = 'others';
          formData.user = term.args[1];
        }
      },
      'd8OpenDate': function(propertyName, term, formData)
      {
        formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], 'YYYY-MM-DD');
      },
      'status': 'division',
      'entrySource': 'division',
      'problemSource': 'division'
    },

    serialize: function()
    {
      return _.extend(FilterView.prototype.serialize.call(this), {
        statuses: dictionaries.statuses,
        divisions: dictionaries.divisions.toJSON(),
        entrySources: dictionaries.entrySources.toJSON(),
        problemSources: dictionaries.problemSources.toJSON()
      });
    },

    serializeFormToQuery: function(selector)
    {
      var fromMoment = time.getMoment(this.$id('from').val(), 'YYYY-MM-DD');
      var toMoment = time.getMoment(this.$id('to').val(), 'YYYY-MM-DD');
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['d8OpenDate', fromMoment.valueOf()]});
      }

      if (toMoment.isValid())
      {
        if (toMoment.valueOf() === fromMoment.valueOf())
        {
          this.$id('to').val(toMoment.add(1, 'days').format('YYYY-MM-DD'));
        }

        selector.push({name: 'lt', args: ['d8OpenDate', toMoment.valueOf()]});
      }

      if (userType === 'mine' || userType === 'unseen')
      {
        selector.push({name: 'eq', args: ['observers.user.id', userType]});
      }
      else if (user)
      {
        selector.push({name: 'eq', args: [
          userType === 'owner' ? 'owner.id' : 'observers.user.id',
          user
        ]});
      }

      ['entrySource', 'problemSource', 'division', 'status'].forEach(function(property)
      {
        var value = this.$id(property).val();

        if (value)
        {
          selector.push({name: 'eq', args: [property, value]});
        }
      }, this);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      setUpUserSelect2(this.$id('user'), {
        view: this
      });

      this.toggleUserSelect2();
    },

    toggleUserSelect2: function()
    {
      var userType = this.$('input[name="userType"]:checked').val();

      this.$id('user').select2('enable', userType === 'others' || userType === 'owner');
    }

  });
});
