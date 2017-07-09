// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './XiconfClient'
], function(
  Collection,
  XiconfClient
) {
  'use strict';

  return Collection.extend({

    model: XiconfClient,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {},
        sort: {prodLine: 1},
        limit: 100,
        selector: {
          name: 'and',
          args: [
            {name: 'populate', args: ['license', ['features']]}
          ]
        }
      });
    },

    comparator: function(a, b)
    {
      a = a.get('prodLine') || '';
      b = b.get('prodLine') || '';

      if (a === b)
      {
        return 0;
      }

      var aMatches = a.match(/^(.*?)([0-9]+)?$/);
      var bMatches = b.match(/^(.*?)([0-9]+)?$/);

      if (aMatches[1] !== bMatches[1])
      {
        return aMatches[1].localeCompare(bMatches[1]);
      }

      var aN = +(aMatches[2] || 0);
      var bN = +(bMatches[2] || 0);

      return aN < bN ? -1 : 1;
    },

    getUsedLicenseIds: function()
    {
      var licenseIds = {};

      this.forEach(function(xiconfClient)
      {
        var license = xiconfClient.get('license');

        if (license && license._id)
        {
          licenseIds[license._id] = true;
        }
        else if (typeof license === 'string')
        {
          licenseIds[license] = true;
        }
      });

      return licenseIds;
    }

  });
});
