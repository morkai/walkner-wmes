// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/pages/DetailsPage","app/core/util/pageActions","../dictionaries","../views/QiResultDetailsView","../views/QiResultHistoryView","app/qiResults/templates/detailsPage"],function(e,i,t,s,n,o,a){"use strict";return i.extend({template:a,baseBreadcrumb:!0,actions:function(){var i=this.model,s=[];if(!i.get("ok")){var n=i.url()+".pdf";s.push({id:"print",icon:"print",label:e(i.getNlsDomain(),"PAGE_ACTION:print"),href:n,callback:function(e){if(0===e.button){var i=window.open(n);return i?(i.onload=i.print.bind(i),!1):void(window.location.href=n)}}})}return i.canEdit()&&s.push(t.edit(i,!1)),i.canDelete()&&s.push(t.delete(i,!1)),s},initialize:function(){i.prototype.initialize.apply(this,arguments),this.setView(".qiResults-detailsPage-properties",this.detailsView),this.setView(".qiResults-detailsPage-history",this.historyView)},destroy:function(){i.prototype.destroy.call(this),s.unload()},defineViews:function(){this.detailsView=new n({model:this.model}),this.historyView=new o({model:this.model})},load:function(e){return e(this.model.fetch(),s.load())},afterRender:function(){i.prototype.afterRender.call(this),s.load()}})});