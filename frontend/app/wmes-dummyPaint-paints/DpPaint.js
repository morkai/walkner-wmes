// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/dummyPaint/paints',

    clientUrlRoot: '#dummyPaint/paints',

    topicPrefix: 'dummyPaint.paints',

    privilegePrefix: 'DUMMY_PAINT',

    nlsDomain: 'wmes-dummyPaint-paints',

    labelAttribute: 'code',

    getLabel: function()
    {
      return this.get('code') + ', ' + this.get('family');
    }

  });
});
