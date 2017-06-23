// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/users/util/setUpUserSelect2',
  'app/pscs/templates/filter'
], function(
  _,
  time,
  FilterView,
  setUpUserSelect2,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      user: '',
      status: ''
    },

    termToForm: {
      'status': function(propertyName, term, formData)
      {
        formData.status = term.args[1];
      },
      'user.id': function(propertyName, term, formData)
      {
        formData.user = term.args[1];
      }
    },

    serializeFormToQuery: function(selector)
    {
      var user = this.$id('user').val();
      var status = this.$id('status').val();

      if (user)
      {
        selector.push({name: 'eq', args: ['user.id', user]});
      }

      if (status)
      {
        selector.push({name: 'eq', args: ['status', status]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      setUpUserSelect2(this.$id('user'), {
        width: '300px',
        view: this
      });
    }

  });
});
