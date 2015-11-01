// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/time","app/i18n","app/user","app/core/View","app/core/util/bindLoadingMessage","../settings","../Report8","../Report8Query","../views/Report8FilterView","../views/Report8DirIndirTableView","../views/Report8TimesTableView","app/reports/templates/report8Page"],function(e,i,t,r,s,n,o,a,h,u,l,p,d){"use strict";return s.extend({layoutName:"page",pageId:"report8",template:d,breadcrumbs:[t.bound("reports","BREADCRUMBS:8")],actions:function(){return[{label:t.bound("reports","PAGE_ACTION:settings"),icon:"cogs",privileges:"REPORTS:MANAGE",href:"#reports;settings?tab=lean"}]},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings(),this.setView(".filter-container",this.filterView),this.setView(".reports-8-dirIndirTable-container",this.dirIndirTableView),this.setView(".reports-8-timesTable-container",this.timesTableView)},destroy:function(){o.release()},defineModels:function(){this.settings=n(o.acquire(),this),this.query=h.fromQuery(this.options.query),this.report=n(new a(null,{query:this.query}),this)},defineViews:function(){this.filterView=new u({model:this.query}),this.dirIndirTableView=new l({model:this.report}),this.timesTableView=new p({model:this.report})},defineBindings:function(){this.listenTo(this.query,"change",this.onQueryChange),this.listenTo(this.timesTableView,"afterRender",this.onTimesTableAfterRender)},load:function(e){return e(this.settings.fetchIfEmpty(function(){return[this.report.fetch()]},this))},afterRender:function(){o.acquire()},onQueryChange:function(e,i){this.promised(this.report.fetch()),i&&i.reset&&this.broker.publish("router.navigate",{url:this.report.url()+"?"+this.query.serializeToString(),replace:!0,trigger:!1})},onTimesTableAfterRender:function(){this.dirIndirTableView.adjustHeight(this.timesTableView.$el.outerHeight())}})});