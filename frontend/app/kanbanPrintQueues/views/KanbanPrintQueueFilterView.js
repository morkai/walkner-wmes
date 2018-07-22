// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/kanbanPrintQueues/templates/filter'
], function(
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      todo: ''
    },

    termToForm: {
      'todo': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].toString();
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.toggleButtonGroup('todo');
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      var view = this;
      var todo = view.getButtonGroupValue('todo');

      if (!todo)
      {
        todo = 'true';

        view.$id('todo').find('input[value="true"]').prop('checked', true);
        view.toggleButtonGroup('todo');
      }

      selector.push({name: 'eq', args: ['todo', todo === 'true']});

      if (todo === 'true')
      {
        rqlQuery.sort = {
          todo: 1,
          createdAt: 1
        };
      }
      else
      {
        rqlQuery.sort = {
          todo: 1,
          createdAt: -1
        };
      }

      rqlQuery.limit = 10;
    }

  });
});
