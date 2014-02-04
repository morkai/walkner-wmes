define(["jquery","app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/View","../HourlyPlan","../views/HourlyPlanFormView","i18n!app/nls/hourlyPlans"],function(e,o,n,l,r,t,i){return r.extend({layoutName:"page",pageId:"hourlyPlanForm",breadcrumbs:[{label:o.bound("hourlyPlans","BREADCRUMBS:entryList"),href:"#hourlyPlans"},o.bound("hourlyPlans","BREADCRUMBS:entryForm")],actions:function(){var n=this;return[{type:"danger",label:o.bound("hourlyPlans","PAGE_ACTION:lock"),icon:"lock",callback:function(o){return n.lockEntry(e(o.target).closest(".btn")),!1}}]},initialize:function(){this.model=l(new t({_id:this.options.modelId}),this),this.view=new i({model:this.model})},load:function(e){return e(this.model.fetch())},lockEntry:function(e){e.hasClass("disabled")||(e.addClass("disabled"),this.socket.emit("hourlyPlans.lockEntry",this.model.id,function(l){return l?(console.error(l),e.removeClass("disabled"),n.msg.show({type:"error",time:5e3,text:o("hourlyPlans","msg:lockFailure")})):void 0}))}})});