// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../core/Model"],function(e,t,i,n){"use strict";var r={pickupRequested:"debug",deliveryRequested:"debug",requestCancelled:"danger",requestAccepted:"warning",requestFinished:"success"};return n.extend({urlRoot:"/isaEvents",clientUrlRoot:"#isa/events",topicPrefix:"isaEvents",privilegePrefix:"ISA",nlsDomain:"isa",serializeRow:function(e){var t=this.toJSON();return t.className=r[this.get("type")],t.time=i.format(t.time,e?"HH:mm:ss":"LL, HH:mm:ss"),t.line=this.getProdLineId(),t.user=this.getUserName(e),t.action=this.getActionText(),t},getProdLineId:function(){var t=this.get("orgUnits"),i=e.last(t);if(i&&"prodLine"===i.type)return i.id;var n=e.find(t,function(e){return"prodLine"===e.type});return n?n.id:null},getUserName:function(e){var t=this.get("user").label;if(!e)return t;var i=t.split(" ");return 1===i.length?t:i[0]+" "+i[1].charAt(0)+"."},getActionText:function(){return t("isa","events:"+this.get("type"),t.flatten(this.get("data")))}})});