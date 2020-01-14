define(["underscore","app/i18n","app/user","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/pages/createPageBreadcrumbs","app/core/pages/DetailsPage","app/data/orgUnits","../views/FteLeaderEntryDetailsView"],function(e,t,i,s,n,a,g,h,o,c){"use strict";return h.extend({pageClassName:"page-max-flex",modelType:"fteLeader",pageId:"fteLeaderEntryDetails",browseBreadcrumb:function(){return"BREADCRUMB:"+this.model.TYPE+":browse"},breadcrumbs:function(){return g(this,[":details"])},actions:function(){var e=this.model,s=e.isEditable(i),n=[];return"request"===s&&this.changing?n.push({id:"saveChangeRequest",type:"primary",icon:"edit",label:t("fte","PAGE_ACTION:changeRequest:save"),callback:this.saveChangeRequest.bind(this)},{id:"cancelChangeRequest",icon:"times",label:t("fte","PAGE_ACTION:changeRequest:cancel"),callback:this.cancelChangeRequest.bind(this)}):"yes"===s?n.push(a.edit(e),a.delete(e)):"request"===s&&n.push({id:"requestChange",icon:"edit",label:t("fte","PAGE_ACTION:edit"),callback:this.toggleChangeRequest.bind(this)}),n},initialize:function(){this.changing="1"===this.options.change,this.model=n(this.model,this),this.view=this.createView()},createView:function(){return new c({model:this.model})},setUpLayout:function(e){this.layout=e},load:function(e){return e(this.model.fetch())},afterRender:function(){this.changing&&(this.changing=!1,this.toggleChangeRequest())},toggleChangeRequest:function(){return this.changing=!this.changing,this.layout.setActions(this.actions,this),this.$el.toggleClass("is-changing",this.changing),this.view.toggleCountEditing(this.changing)},saveChangeRequest:function(){var i=this.toggleChangeRequest();if(!e.isEmpty(i.changes)){var n=this.model,a=o.getByTypeAndId("subdivision",n.get("subdivision")),g=this.ajax({method:"POST",url:"/prodChangeRequests",data:JSON.stringify({creatorComment:i.comment,division:a.get("division"),prodLine:null,modelType:this.modelType,modelId:n.id,operation:"edit",data:{subdivision:a.id,date:n.get("date"),changes:i.changes}})});g.fail(function(){s.msg.show({type:"error",time:5e3,text:t("fte","changeRequest:msg:failure:edit")})}),g.done(function(){s.msg.show({type:"success",time:2500,text:t("fte","changeRequest:msg:success:edit")})})}},cancelChangeRequest:function(){this.toggleChangeRequest()}})});