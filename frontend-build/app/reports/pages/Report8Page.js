// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/time","app/i18n","app/user","app/core/View","app/core/util/bindLoadingMessage","../settings","../Report8","../Report8Query","../views/8/FilterView","../views/8/DirIndirTableView","../views/8/DirIndirChartView","../views/8/TimesTableView","../views/8/TimesChartView","app/reports/templates/8/page"],function(e,i,t,r,s,n,o,a,h,l,d,p,u,w,c){"use strict";return s.extend({layoutName:"page",pageId:"report8",template:c,breadcrumbs:[t.bound("reports","BREADCRUMBS:8")],actions:function(){var e=this;return[{label:t.bound("reports","PAGE_ACTION:8:export"),icon:"download",callback:function(){var i=this.querySelector(".btn");i.disabled=!0;var r=e.ajax({type:"POST",url:"/reports;download?filename="+t("reports","8:filename:export"),contentType:"text/csv",data:e.report.serializeToCsv()});r.done(function(e){window.location.href="/reports;download?key="+e}),r.always(function(){i.disabled=!1})}},{label:t.bound("reports","PAGE_ACTION:settings"),icon:"cogs",privileges:"REPORTS:MANAGE",href:"#reports;settings?tab=lean"}]},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings(),this.setView(".filter-container",this.filterView),this.setView(".reports-8-dirIndirTable-container",this.dirIndirTableView),this.setView(".reports-8-dirIndirChart-container",this.dirIndirChartView),this.setView(".reports-8-timesTable-container",this.timesTableView),this.setView(".reports-8-timesChart-container",this.timesChartView)},destroy:function(){o.release()},defineModels:function(){this.settings=n(o.acquire(),this),this.query=h.fromRequest(this.options.query,this.options.displayOptions),this.report=n(new a(null,{query:this.query}),this)},defineViews:function(){this.filterView=new l({model:this.query}),this.dirIndirTableView=new d({model:this.report}),this.dirIndirChartView=new p({model:this.report}),this.timesTableView=new u({model:this.report}),this.timesChartView=new w({model:this.report})},defineBindings:function(){this.listenTo(this.query,"change",this.onQueryChange),this.listenTo(this.timesTableView,"afterRender",this.onTimesTableAfterRender)},load:function(e){return e(this.settings.fetchIfEmpty(function(){return[this.report.fetch()]},this))},afterRender:function(){o.acquire()},onQueryChange:function(e,i){i&&i.reset&&this.promised(this.report.fetch()),this.broker.publish("router.navigate",{url:this.report.url()+"?"+this.query.serializeToString()+"#"+this.query.serializeSeriesVisibility(),replace:!0,trigger:!1})},onTimesTableAfterRender:function(){this.dirIndirTableView.adjustHeight(this.timesTableView.$el.outerHeight())}})});