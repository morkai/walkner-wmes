define(["underscore","app/i18n","app/viewport","app/core/View","app/core/views/DialogView","app/data/isaPalletKinds","./IsaPalletDeliveryDialogView","app/production/templates/isa","app/production/templates/isaCancelDialog"],function(e,i,t,s,r,n,a,o,l){"use strict";return s.extend({template:o,localTopics:{"socket.disconnected":"render","isaPalletKinds.synced":"render"},events:{"click #-pickup":function(){var e=this.model.isaRequests.getFirstPickup();if(!e)return this.pickup();"new"===e.get("status")&&this.cancel(e)},"click #-deliver":function(){var e=this.model.isaRequests.getFirstDelivery();if(e)"new"===e.get("status")&&this.cancel(e);else{var s=new a({embedded:this.options.embedded,vkb:this.options.vkb});this.listenTo(s,"picked",function(e,i){s.closeDialog(),this.deliver(e,i)}),t.showDialog(s,i("production","isa:deliver:title"))}}},initialize:function(){var i=this;i.syncing=!1,i.rendered=!1;var t=i.model.isaRequests,s=e.debounce(function(){i.rendered&&i.render()},1);i.listenTo(t,"request",function(){i.syncing=!0,s()}),i.listenTo(t,"error sync",function(){i.syncing=!1,s()}),i.listenTo(t,"add remove change reset",s)},serialize:function(){var e=this.syncing,i=this.socket.isConnected(),t=this.model.isLocked(),s=this.model.isaRequests.getFirstPickup(),r=this.model.isaRequests.getFirstDelivery(),n=!!s,a=!!r,o=!!s&&"accepted"===s.get("status"),l=!!r&&"accepted"===r.get("status"),c=r?r.getQty():0,d=r?r.getFullPalletKind():null;return{idPrefix:this.idPrefix,pickupIndicatorColor:this.serializeIndicatorColor(s),deliveryIndicatorColor:this.serializeIndicatorColor(r),pickupStatusLabel:this.serializeStatusLabel(s),pickupActive:n,pickupDisabled:!this.rendered||t||e||!i||o,deliveryStatusLabel:this.serializeStatusLabel(r),deliveryActive:a,deliveryDisabled:!this.rendered||t||e||!i||l,selectedQty:c,selectedPalletKind:d}},serializeIndicatorColor:function(e){if(!e||this.model.isLocked())return"grey";switch(e.get("status")){case"new":return"orange";case"accepted":return"green";default:return"grey"}},serializeStatusLabel:function(e){return i("production","isa:status:"+(e?e.get("status"):"idle"))},afterRender:function(){this.rendered=!0},pickup:function(){this.model.isaRequests.pickup(this.model.getSecretKey(),this.showErrorMessage.bind(this,"pickup"))},deliver:function(e,i){this.model.isaRequests.deliver(e,i,this.model.getSecretKey(),this.showErrorMessage.bind(this,"deliver"))},cancel:function(e){var s=this,n=new r({dialogClassName:"production-modal",template:l,model:{requestType:e.get("type")}});s.listenTo(n,"answered",function(i){"yes"===i&&s.model.isaRequests.cancel(e.id,s.model.getSecretKey(),s.showErrorMessage.bind(s,"cancel"))}),t.showDialog(n,i("production","isa:cancel:title"))},showErrorMessage:function(e,s){s&&t.msg.show({type:"error",time:5e3,text:i.has("isa",e+":"+s.message)?i("isa",e+":"+s.message):i("isa",e+":failure")})}})});