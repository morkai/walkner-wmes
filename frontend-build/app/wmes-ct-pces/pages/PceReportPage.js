define(["underscore","app/i18n","app/core/View","app/core/util/bindLoadingMessage","app/wmes-ct-lines/LineCollection","../PceReport","../views/pceReport/FilterView","../views/pceReport/ProductView","app/wmes-ct-pces/templates/pceReport/page"],function(e,t,i,r,s,n,o,l,c){"use strict";return i.extend({pageClassName:"page-max-flex",layoutName:"page",template:c,breadcrumbs:function(){return[{href:"#ct",label:this.t("BREADCRUMBS:base")},this.t("BREADCRUMBS:pceReport")]},initialize:function(){this.model=r(this.model,this),this.lines=r(new s(null,{rqlQuery:"select(_id)&limit(0)"}),this),this.setView("#-filter",new o({model:this.model,lines:this.lines})),this.listenTo(this.model,"filtered",this.onFiltered),this.listenToOnce(this,"afterRender",function(){this.listenTo(this.model.products,"reset",function(){this.renderProducts(!0)})})},load:function(e){return e(this.lines.fetch({reset:!0}),this.model.fetch())},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})},beforeRender:function(){this.renderProducts(!1)},renderProducts:function(e){var t=this;t.removeView("#-products"),t.model.products.forEach(function(i){var r=new l({model:t.model,product:i});t.insertView("#-products",r),e&&r.render()})}})});