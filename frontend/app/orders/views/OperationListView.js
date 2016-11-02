// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/orders/templates/operationList'
], function(
  _,
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
      var summedTimes = {};

      _.forEach(this.options.summedTimes, function(v, k)
      {
        summedTimes[k] = (Math.round(v * 1000) / 1000).toLocaleString();
      });

      return {
        operations: this.model.get('operations')
          .toJSON()
          .map(function(op)
          {
            formatNumericProperty(op, 'machineSetupTime');
            formatNumericProperty(op, 'laborSetupTime');
            formatNumericProperty(op, 'machineTime');
            formatNumericProperty(op, 'laborTime');
            formatNumericProperty(op, 'sapMachineSetupTime');
            formatNumericProperty(op, 'sapLaborSetupTime');
            formatNumericProperty(op, 'sapMachineTime');
            formatNumericProperty(op, 'sapLaborTime');

            return op;
          })
          .sort(function(a, b) { return a.no - b.no; }),
        highlighted: this.options.highlighted,
        summedTimes: summedTimes
      };
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:operations', this.render);
    }

  });
});
