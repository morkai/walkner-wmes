// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/viewport","app/core/View","app/core/views/DialogView","app/data/isaPalletKinds","app/production/templates/isa","app/production/templates/isaCancelDialog"],function(e,i,t,s,r,n,a,o){"use strict";return s.extend({template:a,localTopics:{"socket.disconnected":"render","isaPalletKinds.synced":"render"},events:{"click #-pickup":function(){var e=this.model.isaRequests.getFirstPickup();return e?void("new"===e.get("status")&&this.cancel(e)):this.pickup()},"click #-deliver":function(){var e=this.model.isaRequests.getFirstDelivery();e&&"new"===e.get("status")&&this.cancel(e)},"click a[data-pallet-kind]":function(e){this.deliver(e.currentTarget.dataset.palletKind)}},initialize:function(){var i=this;i.syncing=!1,i.rendered=!1;var t=i.model.isaRequests,s=e.debounce(function(){i.rendered&&i.render()},1);i.listenTo(t,"request",function(){i.syncing=!0,s()}),i.listenTo(t,"error sync",function(){i.syncing=!1,s()}),i.listenTo(t,"add remove change reset",s)},serialize:function(){var i=this.syncing,t=this.socket.isConnected(),s=this.model.isLocked(),r=this.model.isaRequests.getFirstPickup(),a=this.model.isaRequests.getFirstDelivery(),o=!!r,c=!!a,d=r?"accepted"===r.get("status"):!1,l=a?"accepted"===a.get("status"):!1,u=a?a.getFullPalletKind():null;return{idPrefix:this.idPrefix,palletKinds:n.toJSON(),pickupIndicatorColor:this.serializeIndicatorColor(r),deliveryIndicatorColor:this.serializeIndicatorColor(a),pickupActive:o,pickupDisabled:!this.rendered||s||i||!t||d,deliveryActive:c,deliveryDisabled:!this.rendered||s||i||!t||l,selectedPalletKind:u,dropdownEnabled:e.isEmpty(u)}},serializeIndicatorColor:function(e){if(!e||this.model.isLocked())return"grey";switch(e.get("status")){case"new":return"orange";case"accepted":return"green";default:return"grey"}},afterRender:function(){this.rendered=!0},pickup:function(){this.model.isaRequests.pickup(this.model.getSecretKey(),this.showErrorMessage.bind(this,"pickup"))},deliver:function(e){this.model.isaRequests.deliver(e,this.model.getSecretKey(),this.showErrorMessage.bind(this,"deliver"))},cancel:function(e){var s=this,n=new r({dialogClassName:"production-modal",template:o,model:{requestType:e.get("type")}});s.listenTo(n,"answered",function(i){"yes"===i&&s.model.isaRequests.cancel(e.id,s.model.getSecretKey(),s.showErrorMessage.bind(s,"cancel"))}),t.showDialog(n,i("production","isa:cancel:title"))},showErrorMessage:function(e,s){s&&t.msg.show({type:"error",time:5e3,text:i.has("isa",e+":"+s.message)?i("isa",e+":"+s.message):i("isa",e+":failure")})}})});