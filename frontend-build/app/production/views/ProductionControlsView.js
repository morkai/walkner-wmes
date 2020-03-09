define(["app/i18n","app/user","app/viewport","app/core/View","app/core/util/embedded","app/mor/Mor","app/mor/views/MorView","./UnlockDialogView","./LockDialogView","./ComponentLabelsDialogView","app/production/templates/controls"],function(o,t,n,s,e,i,c,a,d,l,r){"use strict";var h={"socket.connected":"#5BB75B","socket.disconnected":"#DA4F49","socket.connectFailed":"#DA4F49","socket.connecting":"#F0AD4E"};return s.extend({template:r,localTopics:{"socket.connected":function(){this.mor&&this.promised(this.mor.fetch())},"socket.*":function(o,t){var n=h[t];n&&this.$syncControl&&this.$syncControl.css("color",n)},"production.syncing":function(){this.$syncControl&&this.$syncControl.addClass("is-syncing")},"production.synced":function(){this.$syncControl&&this.$syncControl.removeClass("is-syncing")}},events:{"click #-mor":"showMor","click #-componentLabels":"showComponentLabels","click a.production-controls-addNearMiss":"addNearMiss","click a.production-controls-addSuggestion":"addSuggestion","click a.production-controls-addObservation":"addObservation","click a.production-controls-lock":function(){window.WMES_CLIENT?e.isEnabled()&&e.actions.config():this.lock()},"click a.production-controls-unlock":function(){window.WMES_CLIENT?e.isEnabled()&&e.actions.config():this.unlock()},"mouseover a.production-controls-lock":function(o){this.$(o.target).removeClass("fa-unlock").addClass("fa-lock")},"mouseout a.production-controls-lock":function(o){this.$(o.target).removeClass("fa-lock").addClass("fa-unlock")},"mouseover a.production-controls-unlock":function(o){this.$(o.target).removeClass("fa-lock").addClass("fa-unlock")},"mouseout a.production-controls-unlock":function(o){this.$(o.target).removeClass("fa-unlock").addClass("fa-lock")}},initialize:function(){this.mor=null},afterRender:function(){this.$syncControl=this.$(".production-controls-sync"),this.$syncControl.css("color",h[this.socket.isConnected()?"socket.connected":"socket.disconnected"])},addNearMiss:function(){this.addImprovement("/#kaizenOrders;add")},addSuggestion:function(){this.addImprovement("/#suggestions;add")},addObservation:function(){this.addImprovement("/#behaviorObsCards;add")},addImprovement:function(o){var t=this.model.get("operator");t=t&&t.id?{id:t.id,text:t.label.replace(/\s+\(.*?\)$/,"")}:null,o+="?standalone=1&operator="+btoa(encodeURIComponent(JSON.stringify(t)));var s=window.screen,e=s.availWidth>1350?1300:.7*s.availWidth,i=.8*s.availHeight,c=Math.floor((s.availWidth-e)/2),a="resizable,scrollbars,location=no,top="+Math.min(100,Math.floor((s.availHeight-i)/2))+",left="+c+",width="+Math.floor(e)+",height="+Math.floor(i);window.open(o,"WMES_IMPROVEMENT",a)||n.msg.show({type:"error",time:3e3,text:this.t("controls:msg:popup")})},unlock:function(){if(this.model.isLocked()){if(!this.socket.isConnected())return n.msg.show({type:"warning",time:2e3,text:this.t("controls:msg:sync:noConnection")});var o=new a({model:this.model,embedded:this.options.embedded,vkb:this.options.vkb});n.showDialog(o,this.t("unlockDialog:title:unlock"))}},lock:function(){if(!this.socket.isConnected())return n.msg.show({type:"warning",time:2e3,text:this.t("controls:msg:sync:noConnection")});if(!this.model.isLocked()){var o=new d({model:this.model,embedded:this.options.embedded,vkb:this.options.vkb});n.showDialog(o,this.t("unlockDialog:title:lock"))}},showMor:function(){var o=this.mor||new i,t=new c({editable:!1,model:o});if(o.users.length)return n.showDialog(t);var s=this.$id("mor").addClass("disabled");s.find(".fa").removeClass("fa-group").addClass("fa-spinner fa-spin"),this.promised(o.fetch()).done(function(){n.showDialog(t)}).always(function(){s.removeClass("disabled").find(".fa").removeClass("fa-spinner fa-spin").addClass("fa-group")}),this.mor=o},showComponentLabels:function(){var o=new l({model:this.model,vkb:this.options.vkb,embedded:this.options.embedded});n.showDialog(o,this.t("componentLabels:title"))}})});