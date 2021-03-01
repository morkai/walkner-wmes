// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/wmes-gft-tester/templates/tester'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template,

    initialize: function()
    {
      this.listenTo(this.model.tester, 'change', this.render);
    },

    getTemplateData: function()
    {
      const tester = this.model.tester.toJSON();

      return {
        tester: {
          connected: tester.connected,
          name: tester.model && tester.model.name || '',
          program: tester.program,
          outputs: this.serializeOutputs(tester.outputs)
        }
      };
    },

    serializeOutputs: function(outputs)
    {
      const result = [];

      Object.keys(outputs || {}).forEach(channel =>
      {
        outputs[channel].forEach(output =>
        {
          result.push(`${channel}:${output}`);
        });
      });

      return result;
    }

  });
});
