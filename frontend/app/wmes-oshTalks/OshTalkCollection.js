// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OshTalk'
], function(
  Collection,
  OshTalk
) {
  'use strict';

  return Collection.extend({

    model: OshTalk,

    rqlQuery: 'limit(-1337)&sort(-date)'

  });
});
