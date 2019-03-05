// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  '../XiconfProgram',
  'app/xiconfPrograms/templates/filter'
], function(
  _,
  FilterView,
  XiconfProgram,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      name: '',
      type: ''
    },

    termToForm: {
      'name': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = term.args[1];
        }
      },
      'type': function(propertyName, term, formData)
      {
        formData.type = term.args[1];
      }
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.call(this), {
        programTypes: Object.keys(XiconfProgram.TYPES_TO_STEPS)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var name = this.$id('name').val().trim();
      var type = this.$id('type').val();

      if (name.length)
      {
        selector.push({name: 'regex', args: ['name', name, 'i']});
      }

      if (type.length)
      {
        selector.push({name: 'eq', args: ['type', type]});
      }
    }

  });
});
