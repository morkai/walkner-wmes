// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../time","../core/Model"],function(t,e){"use strict";return e.extend({urlRoot:"/prodSerialNumbers",clientUrlRoot:"#prodSerialNumbers",topicPrefix:"prodSerialNumbers",privilegePrefix:"PROD_DATA",nlsDomain:"prodSerialNumbers",serialize:function(){var e=this.toJSON();return e.className=e.taktTime>1e3*e.sapTaktTime?"warning":"success",e.orderNo='<a href="#prodShiftOrders/'+e.prodShiftOrder+'">'+e.orderNo+"</a>",e.scannedAt=t.format(e.scannedAt,"L, LTS"),e.iptAt=e.iptAt?t.format(e.iptAt,"L, LTS"):null,e.taktTime=t.toString(Math.round(e.taktTime/1e3)),e.iptTaktTime=e.iptTaktTime?t.toString(Math.round(e.iptTaktTime/1e3)):"",e.sapTaktTime=e.sapTaktTime?t.toString(e.sapTaktTime):"",e}})});