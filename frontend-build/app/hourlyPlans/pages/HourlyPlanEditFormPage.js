define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../HourlyPlan","../views/HourlyPlanEditFormView"],function(e,i,t,l,r){"use strict";return t.extend({layoutName:"page",pageId:"hourlyPlanEditForm",breadcrumbs:function(){return[{label:e.bound("hourlyPlans","BREADCRUMB:browse"),href:this.model.genClientUrl("base")},{label:this.model.getLabel(),href:this.model.genClientUrl()},e.bound("hourlyPlans","BREADCRUMB:editForm")]},initialize:function(){this.model=i(this.model,this),this.view=new r({model:this.model}),this.listenTo(this.view,"remoteError",function(e){"AUTH"===e.message&&this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!0,replace:!0})})},load:function(e){return e(this.model.fetch())}})});