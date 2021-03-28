// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/core/util/forms/dropdownRadio',
  'app/users/util/setUpUserSelect2',
  'app/kaizenOrders/dictionaries',
  'app/wmes-oshTalks/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  currentUser,
  FilterView,
  idAndLabel,
  dateTimeRange,
  dropdownRadio,
  setUpUserSelect2,
  dictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    filterList: [],
    filterMap: {},

    events: Object.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'change input[name="userType"]': function() { this.toggleUserSelect2(true); },
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
        user: null
      };
    },

    termToForm: {
      'date': dateTimeRange.rqlToForm,
      'auditor.id': function(propertyName, term, formData)
      {
        formData.userType = 'auditor';
        formData.user = term.args[1];
      },
      'participants.id': function(propertyName, term, formData)
      {
        formData.userType = 'participants';
        formData.user = term.args[1];
      },
      'users': function(propertyName, term, formData)
      {
        if (term.args[1] === 'mine')
        {
          formData.userType = 'mine';
          formData.user = currentUser.data._id;
        }
        else
        {
          formData.userType = 'others';
          formData.user = term.args[1];
        }
      },
      'section': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      }
    },

    getTemplateData: function()
    {
      return {
        sections: dictionaries.sections.forEntryType('audits').map(idAndLabel)
      };
    },

    serializeFormToQuery: function(selector)
    {
      var userType = this.$('input[name="userType"]').val();
      var user = this.$id('user').val();

      dateTimeRange.formToRql(this, selector);

      if (userType === 'mine')
      {
        selector.push({name: 'eq', args: ['users', userType]});
      }
      else if (user)
      {
        var userProp;

        if (userType === 'others')
        {
          userProp = 'users';
        }
        else
        {
          userProp = userType + '.id';
        }

        selector.push({name: 'eq', args: [userProp, user]});
      }

      ['section'].forEach(function(property)
      {
        var values = this.$id(property).val() || [];

        if (typeof values === 'string')
        {
          values = values.split(',');
        }

        values = values.filter(function(v) { return !_.isEmpty(v); });

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
        view: this,
        width: '275px',
        noPersonnelId: true
      });

      this.setUpUserType();
      this.toggleUserSelect2(false);
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    setUpUserType: function()
    {
      var view = this;
      var options = [
        'mine',
        'others',
        'auditor',
        'participants'
      ].map(function(userType)
      {
        return {
          value: userType,
          optionLabel: view.t('filter:user:' + userType)
        };
      });

      dropdownRadio(view.$id('userType'), {
        label: view.t('filter:user:others'),
        options: options
      });
    },

    toggleUserSelect2: function(resetUser)
    {
      var userType = this.$('input[name="userType"]').val();
      var mine = userType === 'mine' || userType === 'unseen';
      var $user = this.$id('user').select2('enable', !mine);

      if (resetUser && (mine || !$user.val()))
      {
        $user.select2('data', {
          id: currentUser.data._id,
          text: currentUser.getLabel()
        });
      }
    }

  });
});
