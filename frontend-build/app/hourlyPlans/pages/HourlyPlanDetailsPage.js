// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/user","app/core/View","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/util/html2pdf","app/printers/views/PrinterPickerView","../HourlyPlan","../views/HourlyPlanDetailsView","app/hourlyPlans/templates/printableEntry"],function(e,i,t,l,n,a,o,r,s,p){"use strict";return t.extend({layoutName:"page",pageId:"hourlyPlanDetails",breadcrumbs:function(){return[{label:e.bound("hourlyPlans","BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},this.model.getLabel()]},actions:function(){var e=this,t=[o.pageAction({view:e,tag:"hourlyPlans"},function(i){a(p(e.model.serializeToPrint()),i)})];return e.model.isEditable(i)&&t.push(n.edit(e.model),n.delete(e.model)),t},initialize:function(){this.model=l(this.model,this),this.view=new s({model:this.model})},load:function(e){return e(this.model.fetch())}})});