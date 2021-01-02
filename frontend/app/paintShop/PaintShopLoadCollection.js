// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  'app/core/util/getShiftStartInfo',
  './PaintShopLoad'
], function(
  Collection,
  getShiftStartInfo,
  PaintShopLoad
) {
  'use strict';

  return Collection.extend({

    model: PaintShopLoad,

    rqlQuery: function()
    {
      return 'sort(-_id.ts)&limit(-1337)&_id.ts=ge=' + getShiftStartInfo(Date.now()).startTime;
    }

  });
});
