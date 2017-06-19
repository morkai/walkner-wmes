// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  var TIME_PROPS = {
    machineSetupTime: 'sapMachineSetupTime',
    laborSetupTime: 'sapLaborSetupTime',
    machineTime: 'sapMachineTime',
    laborTime: 'sapLaborTime'
  };

  function formatNumericProperty(obj, prop)
  {
    if (obj[prop])
    {
      obj[prop] = (Math.round(obj[prop] * 1000) / 1000).toLocaleString();
    }
    else
    {
      obj[prop] = '';
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

            op.times = {
              actual: {},
              sap: {},
              summed: {}
            };

            Object.keys(TIME_PROPS).forEach(function(key)
            {
              var sapKey = TIME_PROPS[key];

              op.times.actual[key] = op[key];
              op.times.sap[key] = op[sapKey];
              op.times.summed[key] = summedTimes[key];
            });

            return op;
          })
          .sort(function(a, b) { return a.no - b.no; }),
        highlighted: this.options.highlighted,
        timeProps: Object.keys(TIME_PROPS)
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.model);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:operations', this.render);
    }

  });
});
