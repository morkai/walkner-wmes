// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/dummyPaint/codes',

    clientUrlRoot: '#dummyPaint/codes',

    topicPrefix: 'dummyPaint.codes',

    privilegePrefix: 'DUMMY_PAINT',

    nlsDomain: 'wmes-dummyPaint-codes',

    labelAttribute: 'name'

  });
});
