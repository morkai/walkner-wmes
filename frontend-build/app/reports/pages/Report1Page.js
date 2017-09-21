// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/Collection","app/core/util/pageActions","./DrillingReportPage","../Report1Query","../Report1DisplayOptions","../views/1/HeaderView","../views/1/FilterView","../views/1/DisplayOptionsView","../views/1/ChartsView"],function(e,t,i,s,r,o,n,p,l,a){"use strict";return s.extend({rootBreadcrumbKey:"BREADCRUMBS:1",pageId:"report1",actions:function(t){var r=s.prototype.actions.call(this);return r.unshift(i.export({layout:t,page:this,collection:this.exportCollection,privilege:!1,label:e("reports","PAGE_ACTION:1:export")})),r},initialize:function(){s.prototype.initialize.apply(this,arguments),this.exportCollection=new t(null,{url:"/reports/1"}),this.exportCollection.rqlQuery=this.query,this.exportCollection.length=1},createQuery:function(){return r.fromQuery(this.options.query)},createDisplayOptions:function(){var e={settings:this.settings};return"string"==typeof this.options.displayOptions?o.fromString(this.options.displayOptions,e):new o(this.options.displayOptions,e)},createHeaderView:function(){return new n({model:this.query,displayOptions:this.displayOptions})},createFilterView:function(){return new p({model:this.query})},createDisplayOptionsView:function(){return new l({model:this.displayOptions})},createChartsView:function(e,t){return new a({model:e,settings:this.settings,displayOptions:this.displayOptions,skipRenderCharts:!!t})},afterRender:function(){s.prototype.afterRender.call(this),this.scheduleAutoRefresh()},onQueryChange:function(){s.prototype.onQueryChange.apply(this,arguments),this.exportCollection.trigger("sync")},refresh:function(){s.prototype.refresh.call(this),this.scheduleAutoRefresh()},scheduleAutoRefresh:function(){clearTimeout(this.timers.autoRefresh),this.query.isAutoMode()&&(this.timers.autoRefresh=setTimeout(this.refresh.bind(this),6e5))}})});