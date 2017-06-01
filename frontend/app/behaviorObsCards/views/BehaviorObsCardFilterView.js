// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/behaviorObsCards/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  time,
  FilterView,
  setUpUserSelect2,
  kaizenDictionaries,
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
        section: [],
        userType: 'others',
        user: null,
        from: '',
        to: '',
        anyHard: []
      };
    },

    termToForm: {
      'observer.id': function(propertyName, term, formData)
      {
        formData.userType = 'observer';
        formData.user = term.args[1];
      },
      'users': function(propertyName, term, formData)
      {
        if (term.args[1] === 'mine')
        {
          formData.userType = 'mine';
          formData.user = null;
        }
        else
        {
          formData.userType = 'others';
          formData.user = term.args[1];
        }
      },
      'date': function(propertyName, term, formData)
      {
        formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], 'YYYY-MM-DD');
      },
      'section': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'anyHardObservations': function(propertyName, term, formData)
      {
        if (term.args[1])
        {
          formData.anyHard.push('observations');
        }
      },
      'anyHardRisks': function(propertyName, term, formData)
      {
        if (term.args[1])
        {
          formData.anyHard.push('risks');
        }
      }
    },

    serialize: function()
    {
      return _.extend(FilterView.prototype.serialize.call(this), {
        sections: kaizenDictionaries.sections.toJSON()
      });
    },

    serializeFormToQuery: function(selector)
    {
      var fromMoment = time.getMoment(this.$id('from').val(), 'YYYY-MM-DD');
      var toMoment = time.getMoment(this.$id('to').val(), 'YYYY-MM-DD');
      var userType = this.$('input[name="userType"]:checked').val();
      var user = this.$id('user').val();
      var anyHard = this.getButtonGroupValue('anyHard');

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['date', fromMoment.valueOf()]});
      }

      if (toMoment.isValid())
      {
        if (toMoment.valueOf() === fromMoment.valueOf())
        {
          this.$id('to').val(toMoment.add(1, 'days').format('YYYY-MM-DD'));
        }

        selector.push({name: 'lt', args: ['date', toMoment.valueOf()]});
      }

      if (userType === 'observer')
      {
        selector.push({name: 'eq', args: ['observer.id', user]});
      }
      else if (userType === 'mine')
      {
        selector.push({name: 'eq', args: ['users', 'mine']});
      }
      else if (user)
      {
        selector.push({name: 'eq', args: ['users', user]});
      }

      if (_.contains(anyHard, 'observations'))
      {
        selector.push({name: 'eq', args: ['anyHardObservations', true]});
      }

      if (_.contains(anyHard, 'risks'))
      {
        selector.push({name: 'eq', args: ['anyHardRisks', true]});
      }

      ['section'].forEach(function(property)
      {
        var values = (this.$id(property).val() || []).filter(function(v) { return !_.isEmpty(v); });

        if (values.length === 1)
        {
          selector.push({name: 'eq', args: [property, values[0]]});
        }
        else if (values.length)
        {
          selector.push({name: 'in', args: [property, values]});
        }
      }, this);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      setUpUserSelect2(this.$id('user'), {
        width: '300px',
        view: this
      });

      this.toggleUserSelect2();
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    toggleUserSelect2: function()
    {
      var userType = this.$('input[name="userType"]:checked').val();

      this.$id('user').select2('enable', userType === 'others' || userType === 'observer');
    }

  });
});
