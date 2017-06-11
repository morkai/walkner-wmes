// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/time","app/i18n","app/core/View","app/core/util/bindLoadingMessage","../settings","../Report6","../Report6Query","../Report6ProdTasks","../views/6/FilterView","../views/6/EffAndFteChartView","../views/6/CategoryChartView","../views/6/TotalAndAbsenceChartView","app/reports/templates/6/page","app/reports/templates/6/exportPageAction"],function(t,e,r,s,i,n,a,o,h,l,u,c,d,p,f){"use strict";var g={totalAndAbsence:d,effAndFte:u,category:c};return s.extend({layoutName:"page",pageId:"report6",template:p,breadcrumbs:function(){var t=[],e=this.query.get("parent");if(e){var s;if(r.has("reports","BREADCRUMBS:6:"+e))s=r.bound("reports","BREADCRUMBS:6:"+e);else{var i=this.prodTasks.get(e);s=i?i.getLabel():"?"}t.push({label:r.bound("reports","BREADCRUMBS:6"),href:this.getReportUrl(null).replace("/","#")},s)}else t.push(r.bound("reports","BREADCRUMBS:6"));return t},actions:function(){var t=this;return[{template:f.bind(null,{urls:this.getExportUrls()}),afterRender:function(e){t.$exportAction=e},privileges:"REPORTS:VIEW"},{label:r.bound("reports","PAGE_ACTION:settings"),icon:"cogs",privileges:"REPORTS:MANAGE",href:"#reports;settings?tab=wh"}]},events:{"mousedown [data-parent] .highcharts-title":function(t){if(1===t.button)return!1},"mouseup [data-parent] .highcharts-title":function(t){if(!this.$el.hasClass("is-changing")&&!this.$(".is-fullscreen").length){var e=this.$(t.target).closest(".is-clickable");if(e.length){var r=e.closest(".reports-6-column"),s=r.attr("data-parent");return this.query.get("parent")===s&&(s=r.attr("data-child")||null),1===t.button||t.ctrlKey&&0===t.button?(window.open(this.getReportUrl(s).replace(/^\//,"#")),!1):void(t.ctrlKey||0!==t.button||this.query.set("parent",s,{replace:!1}))}}},"dblclick .highcharts-container":function(t){if(!(void 0!==t.button&&0!==t.button||this.$el.hasClass("is-changing"))){var e=t.target.getAttribute("class");e&&e.indexOf("highcharts-title")!==-1||this.toggleFullscreen(this.$(t.target).closest(".highcharts-container").parent())}}},layout:null,settings:null,query:null,prodTasks:null,report:null,filterView:null,$exportAction:null,initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView)},setUpLayout:function(t){this.layout=t},destroy:function(){n.release(),this.layout=null,this.filterView=null,this.$exportAction=null},defineModels:function(){this.settings=i(n.acquire(),this),this.query=o.fromQuery(this.options.query),this.prodTasks=i(new h(null,{settings:this.settings,paginate:!1}),this),this.report=i(new a(null,{query:this.query}),this),this.listenTo(this.query,"change",this.onQueryChange),this.listenTo(this.query,"change:parent",this.onParentChange),this.once("afterRender",function(){this.report.fetch().always(this.updateBreadcrumbs.bind(this))})},defineViews:function(){this.filterView=new l({model:this.query}),this.chartViews=[]},createChartView:function(t){return new g[t.kind]({type:t.type,unit:t.unit,model:this.report,settings:this.settings,prodTasks:this.prodTasks})},load:function(t){return t(this.settings.fetchIfEmpty(function(){return this.prodTasks.fetch({reset:!0})},this))},beforeRender:function(){this.chartViews.forEach(function(t){t.remove()}),this.chartViews=[]},afterRender:function(){n.acquire(),this.chartsConfiguration=this.prodTasks.createChartsConfiguration(),this.renderChartsColumns(),this.renderChartsViews(),this.changeParent(!1)},renderChartsColumns:function(){var e=this.$id("container");this.chartsConfiguration.forEach(function(r){var s=t('<div class="reports-6-column"></div>'),i=r[0];i.parent&&s.attr("data-parent",i.parent),i.child&&s.attr("data-child",i.child),r.forEach(function(e){var r=t("<div></div>").addClass("reports-6-"+e.kind+"-container").addClass("reports-6-"+e.kind+"-"+e.type);e.parent&&r.addClass("is-clickable"),s.append(r)}),e.append(s)})},renderChartsViews:function(){if(this.chartsConfiguration){var t=this;this.chartsConfiguration.forEach(function(e){e.forEach(function(e){var r=t.createChartView(e);t.chartViews.push(r),t.setView(".reports-6-"+e.kind+"-"+e.type,r)})}),this.chartViews.forEach(function(t){t.isRendered()||t.render()})}},getExportUrls:function(){var t=e.getMoment(this.query.get("from")).hours(6).valueOf(),r=e.getMoment(this.query.get("to")).hours(6).valueOf(),s=[this.settings.getValue("wh.comp.id"),this.settings.getValue("wh.finGoods.id")];return{to:"/warehouse/transferOrders;export?sort(shiftDate)&shiftDate>="+t+"&shiftDate<"+r,fte:"/fte/leader;export?sort(date)&date>="+t+"&date<"+r+"&subdivision=in=("+s+")"}},getReportUrl:function(t){return this.report.url()+"?"+this.query.serializeToString(t)},onQueryChange:function(t,e){var r=t.changedAttributes(),s=void 0!==r.parent;this.broker.publish("router.navigate",{url:this.getReportUrl(),replace:!s,trigger:!1}),!e||!e.reset||s&&1===Object.keys(r).length||this.promised(this.report.fetch()),this.updateExportUrls()},onParentChange:function(){this.changeParent(!0)},updateBreadcrumbs:function(){this.layout&&this.layout.setBreadcrumbs(this.breadcrumbs,this)},changeParent:function(t){this.$el.hasClass("is-changing")&&this.cancelAnimations(),t&&this.$el.addClass("is-changing"),this.$(".is-focused").removeClass("is-focused");var e,r,s=this.query.get("parent"),i=this.$(".reports-6-column"),n=this;s?(e=i.filter(function(){return this.dataset.parent!==s&&this.dataset.child!==s}),r=i.filter('[data-parent="'+s+'"], [data-child="'+s+'"]'),this.$('[data-parent="'+s+'"]').addClass("is-focused")):(e=i.filter("[data-child]"),r=i.filter(function(){return!this.dataset.child})),t?e.fadeOut().promise().done(function(){r.fadeIn().promise().done(function(){n.$el.removeClass("is-changing")})}):(e.hide(),r.show()),this.updateBreadcrumbs()},toggleFullscreen:function(t){var e=this.getView({el:t[0]});if(e&&e.chart){var r=this.$(".reports-6-container");t.hasClass("is-fullscreen")?(t.removeClass("is-fullscreen"),r.removeClass("is-fullscreen").prop("scrollLeft",r.data("scrollLeft")||0)):(r.data("scrollLeft",r.prop("scrollLeft")).prop("scrollLeft",0).addClass("is-fullscreen"),t.addClass("is-fullscreen")),e.chart.reflow()}},updateExportUrls:function(){if(this.$exportAction){var t=this.getExportUrls();this.$exportAction.find('a[data-export="to"]').attr("href",t.to),this.$exportAction.find('a[data-export="fte"]').attr("href",t.fte)}}})});