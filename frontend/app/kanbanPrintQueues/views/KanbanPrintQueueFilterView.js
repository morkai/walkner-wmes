// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/kanbanPrintQueues/templates/filter'
], function(
  _,
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

    events: _.assign({

      'click #-groupByWorkstations': function(e)
      {
        e.currentTarget.classList.toggle('active');

        this.model.setGroupByWorkstations(e.currentTarget.classList.contains('active'));
      }

    }, FilterView.prototype.events),

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.toggleButtonGroup('todo');
      this.$id('groupByWorkstations').toggleClass('active', this.model.getGroupByWorkstations());
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
