// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/gft/pcbs',

    clientUrlRoot: '#gft/pcbs',

    privilegePrefix: 'GFT',

    topicPrefix: 'gft.pcbs',

    nlsDomain: 'wmes-gft-pcbs',

    labelAttribute: 'code',

    getLabel: function()
    {
      return `${this.get('code')} x${this.get('quantity')}`;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.productFamily = obj.productFamily.join(' ▪ ');
      obj.lampColor = obj.lampColor.join(' ▪ ');
      obj.ledCount = obj.ledCount.join(' ▪ ');

      return obj;
    }

  });
});
