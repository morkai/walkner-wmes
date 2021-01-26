// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  '../GftPcb',
  'app/wmes-gft-pcbs/templates/filter'
], function(
  _,
  FilterView,
  GftPcb,
  template
) {
  'use strict';

  return FilterView.extend({

    template,

    events: Object.assign({

      'change #-productFamily': function()
      {
        const values = this.$id('productFamily')
          .val()
          .toUpperCase()
          .split(/[^A-Z0-9]+/)
          .filter(v => /^[A-Z0-9]+$/.test(v));

        this.$id('productFamily').val(values.join(' '));
      },

      'change #-lampColor': function()
      {
        const values = this.$id('lampColor')
          .val()
          .split(/[^0-9]+/)
          .filter(v => /^[0-9]+$/.test(v));

        this.$id('lampColor').val(values.join(' '));
      },

      'change #-ledCount': function()
      {
        const values = this.$id('ledCount')
          .val()
          .split(/[^0-9]+/)
          .filter(v => /^[0-9]+$/.test(v));

        this.$id('ledCount').val(values.join(' '));
      }

    }, FilterView.prototype.events),

    termToForm: {
      'code': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'productFamily': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].join(' ');
      },
      'lampColor': 'productFamily',
      'ledCount': 'productFamily'
    },

    serializeFormToQuery: function(selector)
    {
      const code = this.$id('code').val();

      if (code)
      {
        selector.push({name: 'eq', args: ['code', code]});
      }

      ['productFamily', 'lampColor', 'ledCount'].forEach(prop =>
      {
        const values = this.$id(prop)
          .val()
          .split(' ')
          .filter(v => v.length > 0)
          .map(v => /^[0-9]+$/.test(v) ? +v : v);

        if (values.length)
        {
          selector.push({name: 'in', args: [prop, values]});
        }
      });
    }

  });
});
