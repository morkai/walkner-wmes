// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/wh-deliveredOrders/templates/filter'
], function(
  _,
  FilterView,
  idAndLabel,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'change #-line': 'checkValidity',
      'change #-sapOrder': 'checkValidity'

    }, FilterView.prototype.events),

    termToForm: {
      'line': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'sapOrder': 'line',
      'qtyRemaining': function(propertyName, term, formData)
      {
        formData.onlyRemaining = term.name === 'gt';
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      this.$id('line').select2({
        width: '200px',
        allowClear: true,
        placeholder: ' ',
        data: this.lines.map(idAndLabel)
      });

      this.toggleButtonGroup('onlyRemaining');
    },

    serializeFormToQuery: function(selector)
    {
      var line = this.$id('line').val();
      var sapOrder = this.$id('sapOrder').val();

      if (line)
      {
        selector.push({name: 'eq', args: ['line', line]});
      }

      if (sapOrder)
      {
        selector.push({name: 'eq', args: ['sapOrder', sapOrder]});
      }

      if (this.getButtonGroupValue('onlyRemaining'))
      {
        selector.push({name: 'gt', args: ['qtyRemaining', 0]});
      }
    },

    checkValidity: function()
    {
      var line = this.$id('line').val();
      var sapOrder = this.$id('sapOrder').val();

      this.$id('sapOrder')[0].setCustomValidity(
        line === '' && sapOrder === '' ? this.t('FILTER:lineOrOrder') : ''
      );
    }

  });
});
