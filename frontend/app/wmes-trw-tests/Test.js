// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/trw/tests',

    clientUrlRoot: '#trw/tests',

    topicPrefix: 'trw.tests',

    privilegePrefix: 'TRW',

    nlsDomain: 'wmes-trw-tests',

    getLabel: function()
    {
      return this.get('order') + '/' + this.get('pce');
    }

  });
});
