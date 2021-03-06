// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/xiconf/componentWeights',

    clientUrlRoot: '#xiconf/componentWeights',

    privilegePrefix: 'XICONF',

    topicPrefix: 'xiconfComponentWeights',

    nlsDomain: 'xiconfComponentWeights',

    labelAttribute: 'description'

  });
});
