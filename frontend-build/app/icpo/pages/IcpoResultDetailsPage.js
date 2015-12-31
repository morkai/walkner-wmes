// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../IcpoResult","../views/IcpoResultDetailsView","app/icpo/templates/downloadAction"],function(e,t,i,n,o,a){"use strict";return i.extend({layoutName:"page",breadcrumbs:function(){return[{label:e.bound("icpo","BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},e.bound("icpo","BREADCRUMBS:details")]},actions:function(){var e=this.model,t=e.url()+";";return[{template:function(){var i={};return["orderData","driverData","gprsData","inputData","outputData"].forEach(function(n){var o=e.get(n);i[n]=o&&o.length?t+n:null}),a({files:i})}}]},initialize:function(){this.model=t(new n({_id:this.options.modelId}),this),this.view=new o({model:this.model})},load:function(e){return e(this.model.fetch())}})});