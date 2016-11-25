// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Model'
], function(
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodSerialNumbers',

    clientUrlRoot: '#prodSerialNumbers',

    topicPrefix: 'prodSerialNumbers',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'prodSerialNumbers',

    serialize: function()
    {
      var o = this.toJSON();

      o.orderNo = '<a href="#prodShiftOrders/' + o.prodShiftOrder + '">' + o.orderNo + '</a>';
      o.scannedAt = time.format(o.scannedAt, 'L, LTS');
      o.iptAt = o.iptAt  ? time.format(o.iptAt, 'L, LTS') : null;
      o.taktTime = time.toString(Math.round(o.taktTime / 1000));
      o.iptTaktTime = o.iptTaktTime ? time.toString(Math.round(o.iptTaktTime / 1000)) : '';
      o.sapTaktTime = o.sapTaktTime ? time.toString(o.sapTaktTime) : '';

      return o;
    }

  });

});
