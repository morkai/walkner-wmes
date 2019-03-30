// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/View',
  'app/xiconf/templates/wiring'
], function(
  _,
  time,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    getTemplateData: function()
    {
      return {
        probes: this.serializeProbes()
      };
    },

    serializeProbes: function()
    {
      var view = this;
      var probes = [];
      var metrics = view.model.get('metrics');

      if (!metrics || !metrics.activeProbes)
      {
        return probes;
      }

      var activeProbes = view.toBits(metrics.activeProbes, 11);
      var core5 = activeProbes[10] === '0';

      [1, 2, 3, 4].forEach(function(n)
      {
        var pins = [];
        var inactive = activeProbes[2 + (n - 1) * 2] === '0';

        view.toBits(metrics['probe' + n], 7).forEach(function(bit, i)
        {
          pins.push({
            label: '1.' + (i + 1),
            on: bit === '1',
            inactive: inactive || (core5 && i >= 5)
          });
        });

        inactive = activeProbes[3 + (n - 1) * 2] === '0';

        view.toBits(metrics['probe' + n + 'x'], 7).forEach(function(bit, i)
        {
          pins.push({
            label: '2.' + (i + 1),
            on: bit === '1',
            inactive: inactive || (core5 && i >= 5)
          });
        });

        probes.push({
          n: n,
          pins: pins
        });
      });

      return probes;
    },

    toBits: function(v, length)
    {
      var bits = v.toString(2);

      while (bits.length < length)
      {
        bits = '0' + bits;
      }

      return bits.split('').reverse().slice(0, length);
    }

  });
});
