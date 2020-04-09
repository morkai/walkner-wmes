// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/ct/reports/balancing',

    nlsDomain: 'wmes-ct-balancing',

    fetch: function(options)
    {
      if (!options)
      {
        options = {};
      }

      options.data = options && options.rqlQuery && options.rqlQuery.toString() || {};

      return Model.prototype.fetch.call(this, options);
    },

    parse: function(report)
    {
      return {
        report: report
      };
    }

  });
});
