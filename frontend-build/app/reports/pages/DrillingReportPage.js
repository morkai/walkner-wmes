// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/time","app/data/orgUnits","app/core/View","app/core/util/bindLoadingMessage","../settings","app/reports/templates/drillingReportPage"],function(t,e,i,s,r,n,o,h){"use strict";var a=375,l=248;return r.extend({rootBreadcrumbKey:null,initialSettingsTab:"quantityDone",maxOrgUnitLevel:"prodLine",settings:null,displayOptions:null,query:null,reports:null,chartsViews:null,$charts:null,layoutName:"page",template:h,title:function(){var t=[e.bound("reports",this.rootBreadcrumbKey)],i=s.getByTypeAndId(this.query.get("orgUnitType"),this.query.get("orgUnitId"));if(i){var r="subdivision"===this.query.get("orgUnitType")?i.get("division")+" \\ ":"";t.push(r+i.getLabel())}else t.push(e.bound("reports","BREADCRUMBS:divisions"));return t},actions:function(){return[{label:e.bound("reports","PAGE_ACTION:settings"),icon:"cogs",privileges:"REPORTS:MANAGE",href:"#reports;settings?tab="+this.initialSettingsTab}]},setUpLayout:function(t){this.listenTo(this.query,"change:orgUnitId",function(){t.setTitle(this.title,this)})},events:{"mousedown .reports-drillingChart .highcharts-title":function(t){return 1===t.button?!1:void 0},"mouseup .reports-drillingChart .highcharts-title":function(t){var e=this.getOrgUnitFromChartsElement(this.$(t.target).closest(".reports-drillingCharts"));if(e&&this.maxOrgUnitLevel!==e.type){if(1===t.button||t.ctrlKey&&0===t.button)return e&&window.open(this.getReportUrl(e.type,e.id).replace(/^\//,"#")),!1;if(!t.ctrlKey&&0===t.button){var i=this.$(t.target).closest(".reports-drillingCharts");this.isFullscreen()||this.changeOrgUnit(i)}}},"dblclick .highcharts-container":function(t){if(!(void 0!==t.button&&0!==t.button||this.$el.hasClass("is-changing"))){var e=t.target.getAttribute("class");if(!e||-1===e.indexOf("highcharts-title")){var i=this.$(t.target).closest(".reports-chart"),s=i.closest(".reports-drillingCharts"),r=this.getView({el:s[0]}),n=r.getView({el:i[0]});this.toggleFullscreen(n)}}}},initialize:function(){this.onKeyDown=this.onKeyDown.bind(this),this.defineModels(),this.defineViews(),this.defineBindings(),this.setView(".reports-drillingHeader-container",this.headerView),this.setView(".filter-container",this.filterView),this.setView(".reports-displayOptions-container",this.displayOptionsView),this.insertChartsViews()},defineModels:function(){this.settings=n(o.acquire(),this),this.displayOptions=this.createDisplayOptions(),this.query=this.createQuery(),this.reports=this.createReports(null,null)},createQuery:function(){throw new Error},createDisplayOptions:function(){throw new Error},createReports:function(t,e){function i(){++r}function s(){--r,0===r&&this.updateExtremes()}var r=0,n=this.query.createReports(t,e,{query:this.query,settings:this.settings});return n.forEach(function(t){this.stopListening(t,"request"),this.stopListening(t,"error"),this.stopListening(t,"sync"),this.listenTo(t,"request",i),this.listenTo(t,"error",s),this.listenTo(t,"sync",s)},this),n},defineViews:function(){this.headerView=this.createHeaderView(),this.filterView=this.createFilterView(),this.displayOptionsView=this.createDisplayOptionsView(),this.chartsViews=this.reports.map(function(t){return this.createChartsView(t,!1)},this)},createHeaderView:function(){throw new Error},createFilterView:function(){throw new Error},createDisplayOptionsView:function(){throw new Error},createChartsView:function(t,e){throw new Error},defineBindings:function(){t("body").on("keydown",this.onKeyDown),this.listenTo(this.query,"change",this.onQueryChange),this.listenTo(this.displayOptions,"change",this.onDisplayOptionsChange),this.listenTo(this.filterView,"showDisplayOptions",this.onShowDisplayOptions),this.listenTo(this.displayOptionsView,"showFilter",this.onShowFilter)},destroy:function(){o.release(),t("body").off("keydown",this.onKeyDown),this.$charts=null,this.cancelAnimations()},load:function(t){return t(this.settings.fetchIfEmpty())},afterRender:function(){o.acquire(),this.$charts=this.$id("charts"),this.toggleDeactivatedOrgUnits()},onKeyDown:function(t){if(t.ctrlKey&&32===t.keyCode)return this.toggleDisplayOptionsFilterViews(),!1;if(-1===["INPUT","BUTTON","SELECT"].indexOf(t.target.tagName))return 27===t.keyCode&&this.isFullscreen()?(this.$(".reports-chart.is-fullscreen .highcharts-container").dblclick(),!1):39===t.keyCode?(this.scrollX(!0),!1):37===t.keyCode?(this.scrollX(!1),!1):38===t.keyCode?this.scrollY(!0):40===t.keyCode?this.scrollY(!1):void 0},onQueryChange:function(t,e){var i=t.changedAttributes(),s="undefined"!=typeof i.orgUnitId,r="undefined"==typeof i.orgUnitType?1:2;e.reset||this.broker.publish("router.navigate",{url:this.getReportUrl(),replace:!s,trigger:!1}),e.refreshCharts!==!1&&(s?this.drill(Object.keys(i).length>r):(this.refresh(),i.from&&this.toggleDeactivatedOrgUnits()))},onDisplayOptionsChange:function(t){var e=t.changedAttributes();(void 0!==e.series||void 0!==e.extremes)&&this.updateExtremes(),this.broker.publish("router.navigate",{url:this.getReportUrl(),replace:!0,trigger:!1})},onShowDisplayOptions:function(){this.showDisplayOptionsView()},onShowFilter:function(){this.showFilterView()},showDisplayOptionsView:function(){this.$id("filter").addClass("hidden"),this.$id("displayOptions").removeClass("hidden"),"function"==typeof this.displayOptionsView.shown&&this.displayOptionsView.shown()},showFilterView:function(){this.$id("displayOptions").addClass("hidden"),this.$id("filter").removeClass("hidden"),"function"==typeof this.filterView.shown&&this.filterView.shown()},toggleDisplayOptionsFilterViews:function(){this.$id("displayOptions").hasClass("hidden")?this.showDisplayOptionsView():this.showFilterView()},changeOrgUnit:function(t){if(!this.$el.hasClass("is-changing")){var e=this.getOrgUnitFromChartsElement(t);e&&this.query.set(this.getQueryDataForOrgUnitChange(e))}},getQueryDataForOrgUnitChange:function(t){return{orgUnitType:t.type,orgUnitId:t.id}},getOrgUnitFromChartsElement:function(t){var e=t.attr("data-orgUnitType");if(!e||"prodLine"===e)return null;var i=t.attr("data-orgUnitId");if(!t.prev().length){var r=s.getByTypeAndId(e,i),n=s.getParent(r);e=n?s.getType(n):null,i=n?n.id:null}return{type:e,id:i}},getReportUrl:function(t,e){return this.reports[0].url()+"?"+this.query.serializeToString(t,e)+"#"+this.displayOptions.serializeToString()},getCurrentReport:function(t){for(var e=s.getByTypeAndId(this.query[t?"previous":"get"]("orgUnitType"),this.query[t?"previous":"get"]("orgUnitId")),i=0,r=this.reports.length;r>i;++i){var n=this.reports[i];if(n.get("orgUnit")===e)return n}return null},getChartsViewByReport:function(t){for(var e=0,i=this.chartsViews.length;i>e;++e){var s=this.chartsViews[e];if(s.model===t)return s}return null},isFullscreen:function(){return this.$charts.hasClass("is-fullscreen")},toggleFullscreen:function(t){var e=this.$charts,i=e[0],s=i.ownerDocument.body.scrollTop;e.toggleClass("is-fullscreen");var r=this.isFullscreen(),n="";r&&(n=window.innerHeight-e.position().top-10+"px",e.data("scrollLeft",i.scrollLeft),e.data("scrollTop",s),i.scrollLeft=0),e.css("min-height",n),t.$el.toggleClass("is-fullscreen").css("height",n),"function"==typeof t.onFullscreen&&t.onFullscreen(r),t.chart.destroy(),t.chart=null,t.afterRender(),t.updateChart(),r||(i.scrollLeft=e.data("scrollLeft"),i.ownerDocument.body.scrollTop=e.data("scrollTop"))},cleanFullscreen:function(){this.$charts.removeClass("is-fullscreen");var t=this.$(".reports-chart.is-fullscreen");t.length&&t.find(".highcharts-container").dblclick()},updateExtremes:function(){this.reports.forEach(function(t,e){t.set("isParent",0===e)}),this.displayOptions.updateExtremes(this.reports)},scrollX:function(t){for(var e=Math.round(this.$charts[0].scrollLeft/(a+1))+(t?1:-1),i=this.$charts.children(),s=0,r=0;e>r;++r)s+=i.eq(r).outerWidth();this.$charts.finish().animate({scrollLeft:s},250)},scrollY:function(e){var i,s=t(this.el.ownerDocument.body),r=this.$charts.position(),n=s.find(".navbar-fixed-top").outerHeight()||0,o=r.top-n,h=s.scrollTop();if(o>h){if(e)return;i=0}else i=Math.round((h-o)/l)+(e?-1:1);return s.finish().animate({scrollTop:o+i*l},250),!1},insertChartsViews:function(t,e){this.chartsViews.forEach(function(i,s){i!==t&&this.insertView(".reports-drillingCharts-container",i,e?{insertAt:s}:null)},this)},refresh:function(){this.reports.forEach(function(t){this.promised(t.fetch())},this)},drill:function(t){this.isFullscreen()&&this.cleanFullscreen();var e;this.$el.hasClass("is-changing")?(e=s.RELATION_TYPES.UNRELATED,this.cancelRequests(),this.cancelAnimations(),this.chartsViews.forEach(function(t){t.remove()}),this.chartsViews=[],this.reports=[]):(e=s.getRelationType(this.query.previous("orgUnitType"),this.query.previous("orgUnitId"),this.query.get("orgUnitType"),this.query.get("orgUnitId")),this.$el.addClass("is-changing")),e===s.RELATION_TYPES.CHILD?this.drillDown(t):e===s.RELATION_TYPES.PARENT?this.drillUp(t):this.replace()},drillDown:function(t){var e=this.getCurrentReport(),i=this.getChartsViewByReport(e),s=this.chartsViews.filter(function(t){return t!==i}),r=[];this.reports=this.createReports(e,null),this.chartsViews=this.reports.map(function(t,e){if(0===e)return i;var s=this.createChartsView(t,!0);return r.push(s),s},this),t&&this.promised(e.fetch()),this.moveChartsViews("drillingDown",s,r,i)},drillUp:function(t){var e=this.getCurrentReport(!0),i=this.getChartsViewByReport(e),s=this.chartsViews.filter(function(t){return t!==i}),r=[];this.reports=this.createReports(null,e),this.chartsViews=this.reports.map(function(t){if(t===e)return i;var s=this.createChartsView(t,!0);return r.push(s),s},this),t&&this.promised(e.fetch()),this.moveChartsViews("drillingUp",s,r,i)},replace:function(){var e=this.chartsViews.map(function(t){return t.el});t(e).fadeOut(300).promise().done(function(){this.chartsViews.forEach(function(t){t.remove()}),this.$(".reports-drillingCharts").remove(),this.reports=this.createReports(null,null),this.chartsViews=this.reports.map(function(t){return this.createChartsView(t,!0)},this),this.insertChartsViews(null,!1),this.showChartsViews("replacing",this.chartsViews)}.bind(this))},moveChartsViews:function(t,e,i,s){var r=this.chartsViews.indexOf(s);s.$el.siblings().fadeTo(400,0).promise().done(function(){this.$charts.addClass("is-moving");var n=s.$el.position();s.$el.css({position:"absolute",top:n.top+"px",left:n.left+"px"}),e.forEach(function(t){t.remove()}),this.insertChartsViews(s,"drillingUp"===t),s.$el.animate({left:r*a},300).promise().done(function(){s.$el.css("position",""),this.$charts.removeClass("is-moving"),this.showChartsViews(t,i)}.bind(this))}.bind(this))},showChartsViews:function(e,i){var s=this,r=[],n=[];this.$el.addClass("is-"+e),i.forEach(function(t,e){t.render(),t.$el.css("opacity",0),5>e?r.push(t.el):n.push(t.el)}),this.$el.removeClass("is-"+e),i.forEach(function(t){t.renderCharts(!0)}),t(r).fadeTo(400,1).promise().done(function(){t(n).css("opacity",""),s.$el.removeClass("is-changing"),s.toggleDeactivatedOrgUnits()})},toggleDeactivatedOrgUnits:function(){var t=this.query.get("from");if(!t){var e=i.getMoment();e.hours()<6&&e.subtract(1,"days"),t=e.hours(6).startOf("hour").valueOf()}for(var s=1,r=this.reports.length;r>s;++s){var n=this.reports[s],o=n.get("orgUnit"),h=Date.parse(o.get("deactivatedAt"))||Number.MAX_VALUE;this.chartsViews[s].$el[t>=h?"fadeOut":"fadeIn"]()}}})});