// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../HourlyPlan","../views/HourlyPlanEditFormView"],function(e,i,t,l,n){"use strict";return t.extend({layoutName:"page",pageId:"hourlyPlanEditForm",breadcrumbs:function(){return[{label:e.bound("hourlyPlans","BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},{label:this.model.getLabel(),href:this.model.genClientUrl()},e.bound("hourlyPlans","BREADCRUMBS:editForm")]},initialize:function(){this.model=i(new l({_id:this.options.modelId}),this),this.view=new n({model:this.model}),this.listenTo(this.view,"remoteError",function(e){"AUTH"===e.message&&this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!0,replace:!0})})},load:function(e){return e(this.model.fetch())}})});