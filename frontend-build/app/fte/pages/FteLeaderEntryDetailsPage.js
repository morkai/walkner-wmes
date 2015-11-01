// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/user","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","app/data/orgUnits","../FteLeaderEntry","../views/FteLeaderEntryDetailsView"],function(e,t,i,n,s,a,o,h,g,c){"use strict";return o.extend({modelType:"fteLeader",layoutName:"page",pageId:"fteLeaderEntryDetails",breadcrumbs:[{label:t.bound("fte","BREADCRUMBS:leader:browse"),href:"#fte/leader"},t.bound("fte","BREADCRUMBS:details")],actions:function(){var e=this.model,n=e.isEditable(i),s=[];return"request"===n&&this.changing?s.push({id:"saveChangeRequest",type:"primary",icon:"edit",label:t("fte","PAGE_ACTION:changeRequest:save"),callback:this.saveChangeRequest.bind(this)},{id:"cancelChangeRequest",icon:"times",label:t("fte","PAGE_ACTION:changeRequest:cancel"),callback:this.cancelChangeRequest.bind(this)}):(s.push({label:t.bound("fte","PAGE_ACTION:print"),icon:"print",href:e.genClientUrl("print")}),"yes"===n?s.push(a.edit(e),a["delete"](e)):"request"===n&&s.push({id:"requestChange",icon:"edit",label:t("fte","PAGE_ACTION:edit"),callback:this.toggleChangeRequest.bind(this)})),s},initialize:function(){this.changing="1"===this.options.change,this.model=s(this.createModel(),this),this.view=this.createView()},createModel:function(){return new g({_id:this.options.modelId})},createView:function(){return new c({model:this.model})},setUpLayout:function(e){this.layout=e},load:function(e){return e(this.model.fetch())},afterRender:function(){this.changing&&(this.changing=!1,this.toggleChangeRequest())},toggleChangeRequest:function(){return this.changing=!this.changing,this.layout.setActions(this.actions,this),this.$el.toggleClass("is-changing",this.changing),this.view.toggleCountEditing(this.changing)},saveChangeRequest:function(){var i=this.toggleChangeRequest();if(!e.isEmpty(i.changes)){var s=this.model,a=h.getByTypeAndId("subdivision",s.get("subdivision")),o=this.ajax({method:"POST",url:"/prodChangeRequests",data:JSON.stringify({creatorComment:i.comment,division:a.get("division"),prodLine:null,modelType:this.modelType,modelId:s.id,operation:"edit",data:{subdivision:a.id,date:s.get("date"),changes:i.changes}})});o.fail(function(){n.msg.show({type:"error",time:5e3,text:t("fte","changeRequest:msg:failure:edit")})}),o.done(function(){n.msg.show({type:"success",time:2500,text:t("fte","changeRequest:msg:success:edit")})})}},cancelChangeRequest:function(){this.toggleChangeRequest()}})});