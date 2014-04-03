define([
  '../core/Collection',
  './PressWorksheet'
], function(
  Collection,
  PressWorksheet
) {
  'use strict';

  return Collection.extend({

    model: PressWorksheet,

    rqlQuery: 'select(rid,type,date,shift,master,operator,createdAt,creator)&sort(-date)&limit(15)'

  });
});
