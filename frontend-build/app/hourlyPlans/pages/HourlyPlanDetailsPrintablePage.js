define(["moment","app/i18n","app/data/divisions","app/data/views/renderOrgUnitPath","app/core/util/bindLoadingMessage","app/core/View","../HourlyPlan","../views/HourlyPlanDetailsPrintableView","i18n!app/nls/hourlyPlans"],function(e,t,n,i,r,s,o,a){return s.extend({layoutName:"print",pageId:"hourlyPlanDetailsPrintable",hdLeft:function(){var e=n.get(this.model.get("division"));return t("hourlyPlans","print:hdLeft",{division:e?i(e,!1,!1):"?"})},hdRight:function(){return t("hourlyPlans","print:hdRight",{date:e(this.model.get("date")).format("YYYY-MM-DD"),shift:t("core","SHIFT:"+this.model.get("shift"))})},initialize:function(){this.model=r(new o({_id:this.options.modelId}),this),this.view=new a({model:this.model})},load:function(e){return e(this.model.fetch())}})});