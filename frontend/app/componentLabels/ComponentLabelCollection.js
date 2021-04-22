// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './ComponentLabel'
], function(
  Collection,
  ComponentLabel
) {
  'use strict';

  return Collection.extend({

    model: ComponentLabel,

    rqlQuery: 'sort(componentCode)&limit(-1337)'

  });
});
