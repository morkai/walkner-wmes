// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/orders/templates/operationList'
], function(
  View,
  operationListTemplate
) {
  'use strict';

  function formatNumericProperty(obj, prop)
  {
    if (obj[prop] && obj[prop].toLocaleString)
    {
      obj[prop] = obj[prop].toLocaleString();
    }
  }

  return View.extend({

    template: operationListTemplate,

    serialize: function()
    {
      return {
        operations: this.model.get('operations')
          .toJSON()
          .map(function(op)
          {
            formatNumericProperty(op, 'machineSetupTime');
            formatNumericProperty(op, 'laborSetupTime');
            formatNumericProperty(op, 'machineTime');
            formatNumericProperty(op, 'laborTime');

            return op;
          })
          .sort(function(a, b) { return a.no - b.no; }),
        highlighted: this.options.highlighted
      };
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:operations', this.render);
    }

  });
});
