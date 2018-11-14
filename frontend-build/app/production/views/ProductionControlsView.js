define(["app/i18n","app/user","app/viewport","app/core/View","app/mor/Mor","app/mor/views/MorView","./UnlockDialogView","./LockDialogView","app/production/templates/controls"],function(o,n,t,s,i,e,c,a,r,l,d){"use strict";var u={"socket.connected":"#5BB75B","socket.disconnected":"#DA4F49","socket.connectFailed":"#DA4F49","socket.connecting":"#F0AD4E"};return s.extend({template:r,localTopics:{"socket.connected":function(){this.mor&&this.promised(this.mor.fetch())},"socket.*":function(o,n){var t=u[n];t&&this.$syncControl&&this.$syncControl.css("color",t)},"production.syncing":function(){this.$syncControl&&this.$syncControl.addClass("is-syncing")},"production.synced":function(){this.$syncControl&&this.$syncControl.removeClass("is-syncing")}},events:{"click #-mor":"showMor","click a.production-controls-addNearMiss":"addNearMiss","click a.production-controls-addSuggestion":"addSuggestion","click a.production-controls-addObservation":"addObservation","click a.production-controls-lock":"lock","click a.production-controls-unlock":"unlock","mouseover a.production-controls-lock":function(o){this.$(o.target).removeClass("fa-unlock").addClass("fa-lock")},"mouseout a.production-controls-lock":function(o){this.$(o.target).removeClass("fa-lock").addClass("fa-unlock")},"mouseover a.production-controls-unlock":function(o){this.$(o.target).removeClass("fa-lock").addClass("fa-unlock")},"mouseout a.production-controls-unlock":function(o){this.$(o.target).removeClass("fa-unlock").addClass("fa-lock")}},initialize:function(){this.mor=null},afterRender:function(){this.$syncControl=this.$(".production-controls-sync"),this.$syncControl.css("color",u[this.socket.isConnected()?"socket.connected":"socket.disconnected"])},addNearMiss:function(){this.addImprovement("/#kaizenOrders;add")},addSuggestion:function(){this.addImprovement("/#suggestions;add")},addObservation:function(){this.addImprovement("/#behaviorObsCards;add")},addImprovement:function(n){var s=this.model.get("operator");s=s&&s.id?{id:s.id,text:s.label.replace(/\s+\(.*?\)$/,"")}:null,n+="?standalone=1&operator="+btoa(encodeURIComponent(JSON.stringify(s)));var i=window.screen,e=i.availWidth>1350?1300:.7*i.availWidth,c=.8*i.availHeight,a=Math.floor((i.availWidth-e)/2),r="resizable,scrollbars,location=no,top="+Math.min(100,Math.floor((i.availHeight-c)/2))+",left="+a+",width="+Math.floor(e)+",height="+Math.floor(c);window.open(n,"WMES_IMPROVEMENT",r)||t.msg.show({type:"error",time:3e3,text:o("production","controls:msg:popup")})},unlock:function(){if(!this.socket.isConnected())return t.msg.show({type:"warning",time:2e3,text:o("production","controls:msg:sync:noConnection")});this.model.isLocked()&&t.showDialog(new c({model:this.model}),o("production","unlockDialog:title:unlock"))},lock:function(){if(!this.socket.isConnected())return t.msg.show({type:"warning",time:2e3,text:o("production","controls:msg:sync:noConnection")});this.model.isLocked()||t.showDialog(new a({model:this.model}),o("production","unlockDialog:title:lock"))},showMor:function(){var o=this.mor||new i,n=new e({editable:!1,model:o});if(o.users.length)return t.showDialog(n);var s=this.$id("mor").addClass("disabled");s.find(".fa").removeClass("fa-group").addClass("fa-spinner fa-spin"),this.promised(o.fetch()).done(function(){t.showDialog(n)}).always(function(){s.removeClass("disabled").find(".fa").removeClass("fa-spinner fa-spin").addClass("fa-group")}),this.mor=o}})});