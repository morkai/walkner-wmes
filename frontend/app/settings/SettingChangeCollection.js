// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  './SettingChange'
], function(
  Collection,
  SettingChange
) {
  'use strict';

  return Collection.extend({

    model: SettingChange,

    rqlQuery: 'sort(-time)&limit(20)'

  });
});
