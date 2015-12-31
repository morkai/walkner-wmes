// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/views/FilterView',
  'app/orderDocumentClients/templates/filter'
], function(
  time,
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: function()
    {
      return {
        status: ['online', 'offline'],
        prodLine: ''
      };
    },

    termToForm: {
      'connectedAt': function(propertyName, term, formData)
      {
        formData.status = ['offline'];
      },
      'disconnectedAt': function(propertyName, term, formData)
      {
        formData.status = ['online'];
      },
      'prodLine': function(propertyName, term, formData)
      {
        formData.prodLine = term.args[1];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('status');
    },

    serializeFormToQuery: function(selector)
    {
      var status = this.getButtonGroupValue('status');
      var prodLine = this.$id('prodLine').val().trim();

      if (status.length === 1)
      {
        selector.push({
          name: 'eq',
          args: [
            status[0] === 'online' ? 'disconnectedAt' : 'connectedAt',
            null
          ]
        });
      }

      if (prodLine.length)
      {
        selector.push({name: 'regex', args: ['prodLine', prodLine, 'i']});
      }
    }

  });
});
