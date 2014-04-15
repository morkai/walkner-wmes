// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Collection',
  './Subdivision'
], function(
  Collection,
  Subdivision
) {
  'use strict';

  return Collection.extend({

    model: Subdivision,

    rqlQuery: 'select(division,type,name,prodTaskTags,aor)&sort(division,name)'

  });
});
