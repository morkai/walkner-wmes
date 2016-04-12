// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Feedback'
], function(
  Collection,
  Feedback
) {
  'use strict';

  return Collection.extend({

    model: Feedback,

    rqlQuery: '&sort(createdAt)&limit(20)'

  });
});
