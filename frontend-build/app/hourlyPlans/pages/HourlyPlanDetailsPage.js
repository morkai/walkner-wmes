define(["app/i18n","app/user","app/core/util/bindLoadingMessage","app/core/View","../HourlyPlan","../views/HourlyPlanDetailsView","i18n!app/nls/hourlyPlans"],function(e,i,l,n,o,t){return n.extend({layoutName:"page",pageId:"hourlyPlanDetails",breadcrumbs:[{label:e.bound("hourlyPlans","BREADCRUMBS:entryList"),href:"#hourlyPlans"},e.bound("hourlyPlans","BREADCRUMBS:entryDetails")],actions:function(){var l=[];if(this.model.get("locked"))l.push({label:e.bound("hourlyPlans","PAGE_ACTION:print"),icon:"print",href:this.model.genClientUrl("print")});else if(i.isAllowedTo("HOURLY_PLANS:MANAGE")){if(!i.isAllowedTo("HOURLY_PLANS:ALL")){var n=i.getDivision();if(n&&n.get("_id")!==this.model.get("division"))return l}l.push({label:e.bound("hourlyPlans","PAGE_ACTION:edit"),icon:"edit",href:this.model.genClientUrl("edit"),privileges:"HOURLY_PLANS:MANAGE"})}return l},setUpLayout:function(e){this.layout=e},initialize:function(){this.model=l(new o({_id:this.options.modelId}),this),this.view=new t({model:this.model});var e=this;this.listenToOnce(this.model,"sync",function(){e.model.get("locked")||e.pubsub.subscribe("hourlyPlans.locked."+e.model.id,function(){e.model.set({locked:!0}),e.layout&&e.layout.setActions(e.actions())})})},load:function(e){return e(this.model.fetch())}})});