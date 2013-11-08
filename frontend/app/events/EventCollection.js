define([
  'app/core/Collection',
  './Event'
], function(
  Collection,
  Event
) {
  'use strict';

  return Collection.extend({

    model: Event,

    rqlQuery: 'select(type,severity,user,time,data)&sort(-time)&limit(25)'

  });
});
