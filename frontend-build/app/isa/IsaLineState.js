// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../time","../core/Model","../data/orgUnits"],function(e,t,n){"use strict";function i(e){return"string"==typeof e.updatedAt&&(e.updatedAt=new Date(e.updatedAt)),"string"==typeof e.requestedAt&&(e.requestedAt=new Date(e.requestedAt)),"string"==typeof e.respondedAt&&(e.respondedAt=new Date(e.respondedAt)),e}return t.extend({urlRoot:"/isaLineStates",topicPrefix:"isaLineStates",privilegePrefix:"ISA",nlsDomain:"isa",initialize:function(){this.updateOrgUnits(),this.updateTime(),this.on("change:requestedAt",this.updateTime.bind(this,!1))},parse:i,updateOrgUnits:function(e){var t=n.getAllForProdLine(this.id);t.prodLine=n.getByTypeAndId("prodLine",t.prodLine).getLabel().toUpperCase().replace(/(_+|~.*?)$/,"").replace(/_/g," "),t.prodFlow=n.getByTypeAndId("prodFlow",t.prodFlow).getLabel().replace(/\s+(;|,)/g,"$1"),this.set("orgUnits",t,{silent:e})},updateTime:function(t){this.set("time",e.toTagData(this.get("requestedAt"),!0),{silent:t})},getPalletKind:function(){var e=this.get("data");return e&&e.palletKind||{id:"",label:""}},getWhman:function(){return this.get("responder")||{id:"",label:"?"}},serialize:function(){var e=this.toJSON();return e.palletKind=this.getPalletKind().label,e.whman=this.getWhman().label,e},matchResponder:function(e){if(!e)return!0;var t=this.get("responder");return t&&t.id===e.id},act:function(e,t){var n=this,i=n.sync("patch",n,{attrs:e});return i.fail(function(e){var i=e.responseJSON?e.responseJSON.error:null;i||(i={message:e.statusText}),i.statusCode=e.status,t(i),n.trigger("error")}),i.done(function(e){t(null,e),n.trigger("sync")}),i},pickup:function(e,t){return this.act({action:"requestPickup",secretKey:e},t)},deliver:function(e,t,n){return this.act({action:"requestDelivery",secretKey:t,palletKind:e},n)},cancel:function(e,t){return this.act({action:"cancelRequest",secretKey:e},t)},accept:function(e,t){return this.act({action:"acceptRequest",responder:e},t)},finish:function(e){return this.act({action:"finishRequest"},e)}},{parse:i})});