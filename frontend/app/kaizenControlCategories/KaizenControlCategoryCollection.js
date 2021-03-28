// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KaizenControlCategory'
], function(
  Collection,
  KaizenControlCategory
) {
  'use strict';

  return Collection.extend({

    model: KaizenControlCategory

  });
});
