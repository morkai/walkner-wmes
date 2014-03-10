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

    rqlQuery: '&sort(createdAt)&limit(15)'

  });
});
