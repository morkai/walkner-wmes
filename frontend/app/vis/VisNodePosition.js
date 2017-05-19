// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/vis/nodePositions',

    same: function(x, y)
    {
      return Math.round(x) === Math.round(this.attributes.x)
        && Math.round(y) === Math.round(this.attributes.y);
    }

  });
});
