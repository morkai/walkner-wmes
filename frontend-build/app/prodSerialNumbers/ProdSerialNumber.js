define(["../time","../core/Model"],function(t,r){"use strict";return r.extend({urlRoot:"/prodSerialNumbers",clientUrlRoot:"#prodSerialNumbers",topicPrefix:"prodSerialNumbers",privilegePrefix:"PROD_DATA",nlsDomain:"prodSerialNumbers",serialize:function(){var r=this.toJSON();return r.className=r.taktTime>1e3*r.sapTaktTime?"warning":"success",r.orderNo='<a href="#prodShiftOrders/'+r.prodShiftOrder+'">'+r.orderNo+"</a>",r.scannedAt=t.format(r.scannedAt,"L, LTS"),r.iptAt=r.iptAt?t.format(r.iptAt,"L, LTS"):null,r.taktTime=t.toString(Math.round(r.taktTime/1e3)),r.iptTaktTime=r.iptTaktTime?t.toString(Math.round(r.iptTaktTime/1e3)):"",r.sapTaktTime=r.sapTaktTime?t.toString(r.sapTaktTime):"",r.bom=Array.isArray(r.bom)?r.bom.map(function(t){return t.split(":")[0]}).join(", "):"",r}})});