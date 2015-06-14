// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
        limit: 50,
        selector: {
          name: 'and',
          args: [
            {name: 'populate', args: ['license', ['features']]}
          ]
        }
      });
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
