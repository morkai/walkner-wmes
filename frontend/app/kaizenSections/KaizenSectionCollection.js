// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './KaizenSection'
], function(
  Collection,
  KaizenSection
) {
  'use strict';

  return Collection.extend({

    model: KaizenSection,

    comparator: 'position'

  });
});
