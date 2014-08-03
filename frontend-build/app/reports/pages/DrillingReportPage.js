// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/i18n","app/data/orgUnits","app/core/View","app/core/util/bindLoadingMessage","../ReportSettingCollection","app/reports/templates/drillingReportPage"],function(t,i,e,s,r,n,o){var h=375,l=248;return s.extend({rootBreadcrumbKey:null,initialSettingsTab:"quantityDone",maxOrgUnitLevel:"prodLine",settings:null,displayOptions:null,query:null,reports:null,chartsViews:null,$charts:null,layoutName:"page",template:o,title:function(){var t=[i.bound("reports",this.rootBreadcrumbKey)],s=e.getByTypeAndId(this.query.get("orgUnitType"),this.query.get("orgUnitId"));if(s){var r="subdivision"===this.query.get("orgUnitType")?s.get("division")+" \\ ":"";t.push(r+s.getLabel())}else t.push(i.bound("reports","BREADCRUMBS:divisions"));return t},actions:function(){return[{label:i.bound("reports","PAGE_ACTION:settings"),icon:"cogs",privileges:"REPORTS:MANAGE",href:"#reports;settings?tab="+this.initialSettingsTab}]},setUpLayout:function(t){this.listenTo(this.query,"change:orgUnitId",function(){t.setTitle(this.title,this)})},events:{"mousedown .reports-drillingChart .highcharts-title":function(t){return 1===t.button?!1:void 0},"mouseup .reports-drillingChart .highcharts-title":function(t){var i=this.getOrgUnitFromChartsElement(this.$(t.target).closest(".reports-drillingCharts"));if(this.maxOrgUnitLevel!==i.type){if(1===t.button||t.ctrlKey&&0===t.button)return i&&window.open(this.getReportUrl(i.type,i.id).replace(/^\//,"#")),!1;if(!t.ctrlKey&&0===t.button){var e=this.$(t.target).closest(".reports-drillingCharts");this.isFullscreen()||this.changeOrgUnit(e)}}},"dblclick .highcharts-container":function(t){if(!(void 0!==t.button&&0!==t.button||this.$el.hasClass("is-changing"))){var i=t.target.getAttribute("class");if(!i||-1===i.indexOf("highcharts-title")){var e=this.$(t.target).closest(".reports-chart"),s=e.closest(".reports-drillingCharts"),r=this.getView({el:s[0]}),n=r.getView({el:e[0]});this.toggleFullscreen(n)}}}},initialize:function(){this.onKeyDown=this.onKeyDown.bind(this),this.defineModels(),this.defineViews(),this.defineBindings(),this.setView(".reports-drillingHeader-container",this.headerView),this.setView(".filter-container",this.filterView),this.setView(".reports-displayOptions-container",this.displayOptionsView),this.insertChartsViews()},defineModels:function(){this.settings=r(new n(null,{pubsub:this.pubsub}),this),this.displayOptions=this.createDisplayOptions(),this.query=this.createQuery(),this.reports=this.createReports(null,null)},createQuery:function(){throw new Error},createDisplayOptions:function(){throw new Error},createReports:function(t,i){function e(){++r}function s(){--r,0===r&&this.updateExtremes()}var r=0,n=this.query.createReports(t,i,{query:this.query,settings:this.settings});return n.forEach(function(t){this.stopListening(t,"request"),this.stopListening(t,"error"),this.stopListening(t,"sync"),this.listenTo(t,"request",e),this.listenTo(t,"error",s),this.listenTo(t,"sync",s)},this),n},defineViews:function(){this.headerView=this.createHeaderView(),this.filterView=this.createFilterView(),this.displayOptionsView=this.createDisplayOptionsView(),this.chartsViews=this.reports.map(function(t){return this.createChartsView(t,!1)},this)},createHeaderView:function(){throw new Error},createFilterView:function(){throw new Error},createDisplayOptionsView:function(){throw new Error},createChartsView:function(){throw new Error},defineBindings:function(){t("body").on("keydown",this.onKeyDown),this.listenTo(this.query,"change",this.onQueryChange),this.listenTo(this.displayOptions,"change",this.onDisplayOptionsChange),this.listenTo(this.filterView,"showDisplayOptions",this.onShowDisplayOptions),this.listenTo(this.displayOptionsView,"showFilter",this.onShowFilter)},destroy:function(){t("body").off("keydown",this.onKeyDown),this.$charts=null,this.cancelAnimations()},load:function(t){return t(this.settings.fetch({reset:!0}))},afterRender:function(){this.$charts=this.$id("charts")},onKeyDown:function(t){if(t.ctrlKey&&32===t.keyCode)return this.toggleDisplayOptionsFilterViews(),!1;if(-1===["INPUT","BUTTON","SELECT"].indexOf(t.target.tagName))return 27===t.keyCode&&this.isFullscreen()?(this.$(".reports-chart.is-fullscreen .highcharts-container").dblclick(),!1):39===t.keyCode?(this.scrollX(!0),!1):37===t.keyCode?(this.scrollX(!1),!1):38===t.keyCode?this.scrollY(!0):40===t.keyCode?this.scrollY(!1):void 0},onQueryChange:function(t,i){var e=t.changedAttributes(),s="undefined"!=typeof e.orgUnitId,r="undefined"==typeof e.orgUnitType?1:2;i.reset||this.broker.publish("router.navigate",{url:this.getReportUrl(),replace:!s,trigger:!1}),s?this.drill(Object.keys(e).length>r):this.refresh()},onDisplayOptionsChange:function(t){var i=t.changedAttributes();(void 0!==i.series||void 0!==i.extremes)&&this.updateExtremes(),this.broker.publish("router.navigate",{url:this.getReportUrl(),replace:!0,trigger:!1})},onShowDisplayOptions:function(){this.showDisplayOptionsView()},onShowFilter:function(){this.showFilterView()},showDisplayOptionsView:function(){this.$id("filter").addClass("hidden"),this.$id("displayOptions").removeClass("hidden"),"function"==typeof this.displayOptionsView.shown&&this.displayOptionsView.shown()},showFilterView:function(){this.$id("displayOptions").addClass("hidden"),this.$id("filter").removeClass("hidden"),"function"==typeof this.filterView.shown&&this.filterView.shown()},toggleDisplayOptionsFilterViews:function(){this.$id("displayOptions").hasClass("hidden")?this.showDisplayOptionsView():this.showFilterView()},changeOrgUnit:function(t){if(!this.$el.hasClass("is-changing")){var i=this.getOrgUnitFromChartsElement(t);i&&this.query.set({orgUnitType:i.type,orgUnitId:i.id})}},getOrgUnitFromChartsElement:function(t){var i=t.attr("data-orgUnitType");if(!i||"prodLine"===i)return null;var s=t.attr("data-orgUnitId");if(!t.prev().length){var r=e.getByTypeAndId(i,s),n=e.getParent(r);i=n?e.getType(n):null,s=n?n.id:null}return{type:i,id:s}},getReportUrl:function(t,i){return this.reports[0].url()+"?"+this.query.serializeToString(t,i)+"#"+this.displayOptions.serializeToString()},getCurrentReport:function(t){for(var i=e.getByTypeAndId(this.query[t?"previous":"get"]("orgUnitType"),this.query[t?"previous":"get"]("orgUnitId")),s=0,r=this.reports.length;r>s;++s){var n=this.reports[s];if(n.get("orgUnit")===i)return n}return null},getChartsViewByReport:function(t){for(var i=0,e=this.chartsViews.length;e>i;++i){var s=this.chartsViews[i];if(s.model===t)return s}return null},isFullscreen:function(){return this.$charts.hasClass("is-fullscreen")},toggleFullscreen:function(t){var i=this.$charts,e=i[0],s=e.ownerDocument.body.scrollTop;i.toggleClass("is-fullscreen");var r=this.isFullscreen(),n="";r&&(n=window.innerHeight-i.position().top-10+"px",i.data("scrollLeft",e.scrollLeft),i.data("scrollTop",s),e.scrollLeft=0),i.css("min-height",n),t.$el.toggleClass("is-fullscreen").css("height",n),"function"==typeof t.onFullscreen&&t.onFullscreen(r),t.chart.reflow(),t.chart.redraw(!1),r||(e.scrollLeft=i.data("scrollLeft"),e.ownerDocument.body.scrollTop=i.data("scrollTop"))},cleanFullscreen:function(){this.$charts.removeClass("is-fullscreen");var t=this.$(".reports-chart.is-fullscreen");t.length&&t.find(".highcharts-container").dblclick()},updateExtremes:function(){this.reports.forEach(function(t,i){t.set("isParent",0===i)}),this.displayOptions.updateExtremes(this.reports)},scrollX:function(t){for(var i=Math.round(this.$charts[0].scrollLeft/(h+1))+(t?1:-1),e=this.$charts.children(),s=0,r=0;i>r;++r)s+=e.eq(r).outerWidth();this.$charts.finish().animate({scrollLeft:s},250)},scrollY:function(i){var e,s=t(this.el.ownerDocument.body),r=this.$charts.position(),n=s.find(".navbar-fixed-top").outerHeight()||0,o=r.top-n,h=s.scrollTop();if(o>h){if(i)return;e=0}else e=Math.round((h-o)/l)+(i?-1:1);return s.finish().animate({scrollTop:o+e*l},250),!1},insertChartsViews:function(t,i){this.chartsViews.forEach(function(e,s){e!==t&&this.insertView(".reports-drillingCharts-container",e,i?{insertAt:s}:null)},this)},refresh:function(){this.reports.forEach(function(t){this.promised(t.fetch())},this)},drill:function(t){this.isFullscreen()&&this.cleanFullscreen();var i;this.$el.hasClass("is-changing")?(i=e.RELATION_TYPES.UNRELATED,this.cancelRequests(),this.cancelAnimations(),this.chartsViews.forEach(function(t){t.remove()}),this.chartsViews=[],this.reports=[]):(i=e.getRelationType(this.query.previous("orgUnitType"),this.query.previous("orgUnitId"),this.query.get("orgUnitType"),this.query.get("orgUnitId")),this.$el.addClass("is-changing")),i===e.RELATION_TYPES.CHILD?this.drillDown(t):i===e.RELATION_TYPES.PARENT?this.drillUp(t):this.replace()},drillDown:function(t){var i=this.getCurrentReport(),e=this.getChartsViewByReport(i),s=this.chartsViews.filter(function(t){return t!==e}),r=[];this.reports=this.createReports(i,null),this.chartsViews=this.reports.map(function(t,i){if(0===i)return e;var s=this.createChartsView(t,!0);return r.push(s),s},this),t&&this.promised(i.fetch()),this.moveChartsViews("drillingDown",s,r,e)},drillUp:function(t){var i=this.getCurrentReport(!0),e=this.getChartsViewByReport(i),s=this.chartsViews.filter(function(t){return t!==e}),r=[];this.reports=this.createReports(null,i),this.chartsViews=this.reports.map(function(t){if(t===i)return e;var s=this.createChartsView(t,!0);return r.push(s),s},this),t&&this.promised(i.fetch()),this.moveChartsViews("drillingUp",s,r,e)},replace:function(){var i=this.chartsViews.map(function(t){return t.el});t(i).fadeOut(300).promise().done(function(){this.chartsViews.forEach(function(t){t.remove()}),this.$(".reports-drillingCharts").remove(),this.reports=this.createReports(null,null),this.chartsViews=this.reports.map(function(t){return this.createChartsView(t,!0)},this),this.insertChartsViews(null,!1),this.showChartsViews("replacing",this.chartsViews)}.bind(this))},moveChartsViews:function(t,i,e,s){var r=this.chartsViews.indexOf(s);s.$el.siblings().fadeTo(400,0).promise().done(function(){this.$charts.css("overflow-x","hidden");var n=s.$el.position();s.$el.css({position:"absolute",top:n.top+"px",left:n.left+"px"}),i.forEach(function(t){t.remove()}),this.insertChartsViews(s,"drillingUp"===t),s.$el.animate({left:r*h},300).promise().done(function(){s.$el.css("position",""),this.$charts.css("overflow-x",""),this.showChartsViews(t,e)}.bind(this))}.bind(this))},showChartsViews:function(i,e){var s=this,r=[],n=[];this.$el.addClass("is-"+i),e.forEach(function(t,i){t.render(),t.$el.css("opacity",0),5>i?r.push(t.el):n.push(t.el)}),this.$el.removeClass("is-"+i),e.forEach(function(t){t.renderCharts(!0)}),t(r).fadeTo(400,1).promise().done(function(){t(n).css("opacity",""),s.$el.removeClass("is-changing")})}})});