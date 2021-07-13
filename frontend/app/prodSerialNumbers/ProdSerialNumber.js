// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../user',
  '../core/Model'
], function(
  time,
  user,
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

      o.className = o.taktTime > o.sapTaktTime * 1000 ? 'warning' : 'success';
      o.orderNo = o.prodShiftOrder && user.isAllowedTo('PROD_DATA:VIEW')
        ? `<a href="#prodShiftOrders/${o.prodShiftOrder}">${o.orderNo}</a>`
        : o.orderNo;
      o.scannedAt = time.format(o.scannedAt, 'L, LTS');
      o.iptAt = o.iptAt ? time.format(o.iptAt, 'L, LTS') : null;
      o.taktTime = o.taktTime ? time.toString(Math.round(o.taktTime / 1000)) : '';
      o.iptTaktTime = o.iptTaktTime ? time.toString(Math.round(o.iptTaktTime / 1000)) : '';
      o.sapTaktTime = o.sapTaktTime ? time.toString(o.sapTaktTime) : '';
      o.bom = !Array.isArray(o.bom) ? '' : o.bom.map(function(v) { return v.split(':')[0]; }).join(', ');

      return o;
    }

  });
});
