define(["underscore","jquery","app/user","app/socket","app/core/View","app/core/util/onModelDeleted","app/core/util/pageActions","../dictionaries","../Entry","../views/details/PropsView","../views/details/FuncsView","../views/details/ChatView","../views/details/AttachmentsView","../views/details/OrdersView","app/wmes-compRel-entries/templates/details/page"],function(e,t,i,s,n,o,a,l,c,r,d,h,p,u,f){"use strict";return n.extend({pageClassName:"page-max-flex",template:f,remoteTopicsAfterSync:!0,remoteTopics:function(){var e={"compRel.entries.deleted":"onDeleted"};return e["compRel.entries.updated."+this.model.id]="onUpdated",e},breadcrumbs:function(){return[{href:this.model.genClientUrl("base"),label:this.t("BREADCRUMB:browse")},this.model.getLabel()]},actions:function(){var e=this,i=[];return c.can.accept(e.model)&&i.push({icon:"gavel",label:e.t("PAGE_ACTION:accept"),callback:function(){t(".btn",this).blur();var i=e.funcsView.$('.compRel-details-func[data-status="pending"]').first();i.length?i.find(".compRel-details-accept").click():e.funcsView.$(".compRel-details-accept").first().click()}}),c.can.releaseOrder(e.model)&&i.push({icon:"plus",label:e.t("PAGE_ACTION:releaseOrder"),callback:function(){t(".btn",this).blur(),e.ordersView.showReleaseOrderDialog()}}),i.push({icon:"calendar",label:e.t("PAGE_ACTION:history"),href:e.model.genClientUrl("history"),disabled:!0},a.edit(e.model),a.delete(e.model)),i},initialize:function(){n.prototype.initialize.apply(this,arguments),this.defineViews(),this.defineBindings(),this.setView("#-props",this.propsView),this.setView("#-funcs",this.funcsView),this.setView("#-chat",this.chatView),this.setView("#-attachments",this.attachmentsView),this.setView("#-orders",this.ordersView)},defineViews:function(){this.propsView=new r({model:this.model}),this.funcsView=new d({model:this.model}),this.chatView=new h({model:this.model}),this.attachmentsView=new p({model:this.model}),this.ordersView=new u({model:this.model})},defineBindings:function(){var t=this,i=t.model,s=parseInt(i.id,10)<9999999;t.listenToOnce(i,"sync",function(){t.listenTo(i,"sync",t.render),t.listenTo(i,"change:status change:funcs",e.debounce(t.updateActions.bind(t),1)),s&&t.broker.publish("router.navigate",{url:i.genClientUrl(),replace:!0,trigger:!1})})},load:function(e){return e(this.model.fetch())},setUpLayout:function(e){this.layout=e},destroy:function(){t(window).off("."+this.idPrefix)},afterRender:function(){n.prototype.afterRender.apply(this,arguments)},updateActions:function(){this.layout&&this.layout.setActions(this.actions,this)},onDeleted:function(e){o(this.broker,this.model,e)},onUpdated:function(e){e.socketId&&e.socketId===s.getId()||this.model.handleChange(e.change)}})});