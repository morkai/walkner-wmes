// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Collection',
  './MechOrder'
], function(
  Collection,
  MechOrder
) {
  'use strict';

  return Collection.extend({

    model: MechOrder,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {
          name: 1,
          mrp: 1,
          materialNorm: 1
        },
        limit: 15,
        sort: {
          _id: 1
        }
      });
    }

  });
});
