define(["app/i18n","app/user","app/core/util/bindLoadingMessage","app/core/View","../FteMasterEntry","../views/FteMasterEntryDetailsView"],function(e,t,i,n,o,s){return n.extend({layoutName:"page",pageId:"fteMasterEntryDetails",breadcrumbs:[{label:e.bound("fte","BREADCRUMBS:master:entryList"),href:"#fte/master"},e.bound("fte","BREADCRUMBS:master:entryDetails")],actions:function(){var i=[];if(this.model.get("locked"))i.push({label:e.bound("fte","PAGE_ACTION:print"),icon:"print",href:this.model.genClientUrl("print")});else if(t.isAllowedTo("FTE:MASTER:MANAGE")){if(!t.isAllowedTo("FTE:MASTER:ALL")){var n=t.getDivision();if(n&&n.get("_id")!==this.model.get("division"))return i}i.push({label:e.bound("fte","PAGE_ACTION:edit"),icon:"edit",href:this.model.genClientUrl("edit"),privileges:"FTE:MASTER:MANAGE"})}return i},setUpLayout:function(e){this.layout=e},initialize:function(){this.model=i(new o({_id:this.options.modelId}),this),this.view=new s({model:this.model});var e=this;this.listenToOnce(this.model,"sync",function(){e.model.get("locked")||e.pubsub.subscribe("fte.master.locked."+e.model.id,function(){e.model.set({locked:!0}),e.layout&&e.layout.setActions(e.actions())})})},load:function(e){return e(this.model.fetch())}})});