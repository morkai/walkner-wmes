// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/old/wh/lines',

    clientUrlRoot: '#wh/lines',

    topicPrefix: 'old.wh.lines',

    privilegePrefix: 'WH',

    nlsDomain: 'wh-lines',

    serialize: function()
    {
      var obj = this.toJSON();

      return obj;
    }

  });
});
