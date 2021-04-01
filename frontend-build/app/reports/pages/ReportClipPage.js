define(["underscore","jquery","app/i18n","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/data/orgUnits","app/delayReasons/storage","./DrillingReportPage","../ReportClipOrderCollection","../ReportClipQuery","../ReportClipDisplayOptions","../ReportClipPlanners","../views/clip/HeaderView","../views/clip/FilterView","../views/clip/DisplayOptionsView","../views/clip/ChartsView","../views/clip/OrdersView","app/reports/templates/clip/page"],function(e,t,i,s,n,r,o,a,p,l,d,h,u,c,g,y,f,m){"use strict";return a.extend({template:m,rootBreadcrumbKey:"BREADCRUMB:2",initialSettingsTab:"clip",maxOrgUnitLevel:"prodFlow",pageId:"clipReport",remoteTopics:{"orders.updated.*":"onOrderUpdated"},actions:function(e){var t=a.prototype.actions.call(this);return t.unshift(n.export({layout:e,page:this,collection:this.orders,privilege:!1,label:this.t("PAGE_ACTION:2:export")})),t},setUpLayout:function(e){this.layout=e},initialize:function(){a.prototype.initialize.call(this),this.setView("#-orders",this.ordersView)},destroy:function(){a.prototype.destroy.call(this),o.release(),this.layout=null},defineModels:function(){a.prototype.defineModels.call(this),this.planners=s(new h,this),this.delayReasons=s(o.acquire(),this),this.orders=s(new p(null,{query:this.query,displayOptions:this.displayOptions}),this),this.paginationData=this.orders.paginationData},defineViews:function(){a.prototype.defineViews.call(this),this.ordersView=new f({collection:this.orders,planners:this.planners,delayReasons:this.delayReasons})},defineBindings:function(){var e=this;a.prototype.defineBindings.call(e),e.listenTo(e.orders.paginationData,"change",function(){var t={limit:e.paginationData.get("limit"),skip:e.paginationData.get("skip")};e.query.set(t,{silent:!0})}),e.listenTo(e.query,"change",function(){e.layout.setActions(e.actions,e),e.repositionExportAction()}),e.listenTo(e.query,"change:skip",function(){e.orders.rqlQuery.skip=e.query.get("skip")}),e.listenTo(e.query,"change:limit",function(){e.orders.rqlQuery.limit=e.query.get("limit")}),e.listenTo(e,"loading:started",function(t){0===t&&(e.orders.hash=null,e.orders.reset([]))}),e.listenTo(e,"loading:completed",function(){e.loadMrpsIfNecessary();var t=e.reports[0];e.query.set({orderHash:t.get("orderHash"),orderCount:t.get("orderCount")},{silent:!0})}),e.listenTo(e,"loading:finishing",function(){e.orders.hash!==e.query.get("orderHash")&&e.orders.fetch({reset:!0})}),e.listenTo(e,"operation:completed",function(t){e.removeExtraChart="drillingUp"===t})},onDisplayOptionsChange:function(e){a.prototype.onDisplayOptionsChange.call(this,e),this.paginationData.set("urlTemplate",this.orders.genPaginationUrlTemplate())},getQueryDataForOrgUnitChange:function(t){return e.assign(a.prototype.getQueryDataForOrgUnitChange.call(this,t),{skip:0})},getOrgUnitFromChartsElement:function(t){var i=a.prototype.getOrgUnitFromChartsElement.apply(this,arguments);if(!i)return null;var s=!t.prev().length;if("division"===i.type){var n=r.getByTypeAndId("division",i.id),o=r.getChildren(n).filter(function(e){return"assembly"===e.get("type")});if(1===o.length&&!s)return{type:"subdivision",id:o[0].id};if(1===o.length&&s)return{type:null,id:null}}else if("subdivision"===i.type&&s){var p=t.attr("data-orgUnitId"),l=e.find(this.reports,function(e){return e.get("orgUnit").id===p});i.id=l.get("parent")}return i},load:function(e){return e(this.planners.fetch(),this.delayReasons.isEmpty()?this.delayReasons.fetch({reset:!0}):null,this.settings.isEmpty()?this.settings.fetch({reset:!0}):null)},afterRender:function(){a.prototype.afterRender.call(this),o.acquire(),this.repositionExportAction(),this.loadMrpsIfNecessary()},createQuery:function(){return new l(this.options.query)},createDisplayOptions:function(){var e={settings:this.settings};return"string"==typeof this.options.displayOptions?d.fromString(this.options.displayOptions,e):new d(this.options.displayOptions,e)},createHeaderView:function(){return new u({model:this.query,displayOptions:this.displayOptions})},createFilterView:function(){return new c({settings:this.settings,model:this.query})},createDisplayOptionsView:function(){return new g({model:this.displayOptions})},createChartsView:function(e,t){return new y({model:e,settings:this.settings,displayOptions:this.displayOptions,delayReasons:this.delayReasons,skipRenderCharts:!!t})},createReportOptions:function(){return e.assign(a.prototype.createReportOptions.apply(this,arguments),{delayReasons:o.acquire()})},onOrderUpdated:function(t){var i=this.orders.get(t._id);if(i){var s=t.change,n=s.newValues.delayReason,r=s.newValues.m4,o=s.comment,a={};e.isUndefined(n)||(a.delayReason=n),e.isUndefined(r)||(a.m4=r),e.isEmpty(o)||(a.comment=o),i.set(a),Array.isArray(i.get("changes"))||i.set("changes",[],{silent:!0}),i.get("changes").push(s),i.trigger("push:change",s),this.orders.trigger("push:change",s)}},loadMrpsIfNecessary:function(){var e=this.query.get("orgUnitType");e&&"division"!==e&&0!==this.reports.length&&0!==this.reports[0].get("children").length&&(this.headerView.update(this.reports[0]),1===this.reports.length?this.drillDown(!1):this.removeExtraChart&&(this.getViews("#-charts").value()[1].remove(),this.removeExtraChart=!1))},repositionExportAction:function(){t(".page-actions-export").parent().css({position:"absolute",right:"24px",top:this.$id("orders")[0].getBoundingClientRect().top+9+"px"})}})});