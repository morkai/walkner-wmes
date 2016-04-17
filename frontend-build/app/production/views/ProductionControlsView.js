// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/user","app/viewport","app/core/View","app/production/templates/controls","./UnlockDialogView","./LockDialogView"],function(o,t,n,e,c,s,i){"use strict";var l={"socket.connected":"#5BB75B","socket.disconnected":"#DA4F49","socket.connectFailed":"#DA4F49","socket.connecting":"#F0AD4E"};return e.extend({template:c,localTopics:{"socket.*":function(o,t){var n=l[t];n&&this.$syncControl.css("color",n)},"production.syncing":function(){this.$syncControl.addClass("fa-spin")},"production.synced":function(){this.$syncControl.removeClass("fa-spin")}},events:{"click a.production-controls-addSuggestion":"addSuggestion","click a.production-controls-lock":"lock","click a.production-controls-unlock":"unlock","mouseover a.production-controls-lock":function(o){this.$(o.target).removeClass("fa-unlock").addClass("fa-lock")},"mouseout a.production-controls-lock":function(o){this.$(o.target).removeClass("fa-lock").addClass("fa-unlock")},"mouseover a.production-controls-unlock":function(o){this.$(o.target).removeClass("fa-lock").addClass("fa-unlock")},"mouseout a.production-controls-unlock":function(o){this.$(o.target).removeClass("fa-unlock").addClass("fa-lock")}},afterRender:function(){this.$syncControl=this.$(".production-controls-sync"),this.$syncControl.css("color",l[this.socket.isConnected()?"socket.connected":"socket.disconnected"])},addSuggestion:function(){var t=this.model.get("operator");t=t&&t.id?{id:t.id,text:t.label.replace(/\s+\(.*?\)$/,"")}:null;var e="/#suggestions;add?standalone=1&operator="+btoa(encodeURIComponent(JSON.stringify(t))),c=window.screen,s=c.availWidth>1200?1200:.7*c.availWidth,i=.8*c.availHeight,l=Math.floor((c.availWidth-s)/2),a=Math.min(100,Math.floor((c.availHeight-i)/2)),r="resizable,scrollbars,location=no,top="+a+",left="+l+",width="+Math.floor(s)+",height="+Math.floor(i),d=window.open(e,"WMES_SUGGESTIONS",r);d||n.msg.show({type:"error",time:3e3,text:o("production","controls:msg:popup")})},unlock:function(){return this.socket.isConnected()?void(this.model.isLocked()&&n.showDialog(new s({model:this.model}),o("production","unlockDialog:title:unlock"))):n.msg.show({type:"warning",time:2e3,text:o("production","controls:msg:sync:noConnection")})},lock:function(){return this.socket.isConnected()?void(this.model.isLocked()||n.showDialog(new i({model:this.model}),o("production","unlockDialog:title:lock"))):n.msg.show({type:"warning",time:2e3,text:o("production","controls:msg:sync:noConnection")})}})});