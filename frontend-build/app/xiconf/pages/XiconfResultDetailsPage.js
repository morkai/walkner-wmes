define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../XiconfResult","../views/XiconfResultDetailsView","app/xiconf/templates/downloadAction"],function(e,t,i,n,l,r){"use strict";return i.extend({layoutName:"page",pageId:"xiconfResultDetails",remoteTopics:{"xiconf.results.synced":function(e){var t=this.model.get("order");Array.isArray(e.orders)&&t&&-1!==e.orders.indexOf(t._id)&&this.promised(this.model.fetch())},"xiconf.results.toggled":function(e){this.model.id===e.resultId&&this.model.set("cancelled",e.cancelled)}},breadcrumbs:function(){return[e.bound("xiconf","BREADCRUMB:base"),{label:e.bound("xiconf","BREADCRUMB:browse"),href:this.model.genClientUrl("base")},e.bound("xiconf","BREADCRUMB:details")]},actions:function(){var e=this,t=e.model,i=t.get("workflow"),n=t.get("feature"),l=t.get("gprsOrderFile"),o=t.get("gprsInputFile"),s=t.get("gprsOutputFile"),u=t.url()+";";return[{template:function(){return e.renderPartialHtml(r,{files:{gprsOrderFile:l&&l.length?u+"gprsOrder":null,workflow:i&&i.length?u+"workflow":null,feature:n&&n.length?u+"feature":null,gprsInputFile:o&&o.length?u+"gprsInput":null,gprsOutputFile:s&&s.length?u+"gprsOutput":null}})}}]},initialize:function(){this.model=t(new n({_id:this.options.modelId}),this),this.view=new l({model:this.model,tab:this.options.tab})},load:function(e){return e(this.model.fetch())}})});