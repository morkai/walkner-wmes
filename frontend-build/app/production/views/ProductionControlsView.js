// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","app/viewport","app/core/View","app/production/templates/controls"],function(o,t,n,c,e){var s={"socket.connected":"#5BB75B","socket.disconnected":"#DA4F49","socket.connectFailed":"#DA4F49","socket.connecting":"#F0AD4E"};return c.extend({template:e,localTopics:{"socket.*":function(o,t){var n=s[t];n&&this.$syncControl.css("color",n)},"production.syncing":function(){this.$syncControl.addClass("fa-spin")},"production.synced":function(){this.$syncControl.removeClass("fa-spin")}},events:{"click a.production-controls-lock":function(){this.model.setSecretKey(null)},"click a.production-controls-unlock":"unlock","mouseover a.production-controls-lock":function(o){this.$(o.target).removeClass("fa-unlock").addClass("fa-lock")},"mouseout a.production-controls-lock":function(o){this.$(o.target).removeClass("fa-lock").addClass("fa-unlock")},"mouseover a.production-controls-unlock":function(o){this.$(o.target).removeClass("fa-lock").addClass("fa-unlock")},"mouseout a.production-controls-unlock":function(o){this.$(o.target).removeClass("fa-unlock").addClass("fa-lock")}},initialize:function(){},destroy:function(){},serialize:function(){return{}},afterRender:function(){this.$syncControl=this.$(".production-controls-sync"),this.$syncControl.css("color",s[this.socket.isConnected()?"socket.connected":"socket.disconnected"])},unlock:function(){if(!this.socket.isConnected())return n.msg.show({type:"warning",time:2e3,text:o("production","controls:msg:sync:noConnection")});var t=this.model;this.socket.emit("production.getSecretKey",this.model.prodLine.id,function(c,e){return c?n.msg.show({type:"error",time:2e3,text:o("production","controls:msg:sync:remoteError")}):(t.setSecretKey(e),void n.msg.show({type:"success",time:2e3,text:o("production","controls:msg:sync:success")}))})}})});