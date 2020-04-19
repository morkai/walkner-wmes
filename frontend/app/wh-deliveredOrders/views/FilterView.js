// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/wh-deliveredOrders/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  FilterView,
  idAndLabel,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    termToForm: {
      'line': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'sapOrder': 'line',
      'status': 'line'
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.once('afterRender', function()
      {
        this.listenTo(this.lines, 'add remove change', _.debounce(this.setUpLineSelect2.bind(this), 30));
      });
    },

    destroy: function()
    {
      FilterView.prototype.destroy.apply(this, arguments);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.setUpLineSelect2();

      this.$('.is-expandable').expandableSelect();
    },

    setUpLineSelect2: function()
    {
      this.$id('line').select2({
        width: '200px',
        allowClear: true,
        placeholder: ' ',
        data: this.lines.map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var line = this.$id('line').val();
      var sapOrder = this.$id('sapOrder').val();
      var status = this.$id('status').val();

      if (line)
      {
        selector.push({name: 'eq', args: ['line', line]});
      }

      if (sapOrder)
      {
        selector.push({name: 'eq', args: ['sapOrder', sapOrder]});
      }

      if (status && status.length)
      {
        selector.push({name: 'in', args: ['status', status]});
      }
    }

  });
});
