define(["jquery","app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/pages/FilteredListPage","../views/OrderDocumentClientListView","../views/OrderDocumentClientFilterView"],function(e,i,n,s,t,o,r){"use strict";return t.extend({FilterView:r,ListView:o,breadcrumbs:function(){return[i.bound("orderDocumentClients","BREADCRUMBS:base"),i.bound("orderDocumentClients","BREADCRUMBS:browse")]},actions:function(){return[{label:i.bound("orderDocumentClients","page:settings"),icon:"cogs",privileges:"DOCUMENTS:MANAGE",href:"#orders;settings?tab=documents"}]},initialize:function(){t.prototype.initialize.apply(this,arguments),this.$licensingMessage=null},destroy:function(){t.prototype.destroy.call(this),null!==this.$licensingMessage&&(this.$licensingMessage.remove(),this.$licensingMessage=null)},afterRender:function(){t.prototype.afterRender.call(this),this.checkLicensing()},checkLicensing:function(){var e=this;this.ajax({method:"GET",url:"/orderDocuments/licensing"}).done(function(i){e.showLicensingMessage(i.clientCount,i.licenseCount)})},showLicensingMessage:function(n,s){null!==this.$licensingMessage&&(this.$licensingMessage.remove(),this.$licensingMessage=null),n<=s||(this.$licensingMessage=e("<a></a>").attr("href","#licenses?sort(expireDate)&limit(20)&appId=wmes-docs").addClass("orderDocumentClients-licensingMessage message message-warning message-inline").text(i("orderDocumentClients","licensingMessage",{clientCount:n,licenseCount:s})).prependTo(this.$el))}})});