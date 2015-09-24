// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/i18n","app/core/View","app/core/util/bindLoadingMessage","../dictionaries","../OpinionSurveyCollection","../OpinionSurveyReport","../OpinionSurveyReportQuery","../views/OpinionSurveyReportFilterView","../views/ResponseCountTableView","../views/ResponseCountByDivisionChartView","../views/ResponseCountBySuperiorChartView","../views/ResponsePercentBySurveyChartView","../views/ResponsePercentByDivisionChartView","../views/AnswerCountTotalChartView","../views/PositiveAnswerPercentBySurveyChartView","../views/PositiveAnswerPercentByDivisionChartView","app/opinionSurveys/templates/reportPage"],function(e,i,s,t,r,n,o,u,h,p,y,v,w,a,c,l,f,d){"use strict";return s.extend({layoutName:"page",template:d,breadcrumbs:[i.bound("opinionSurveys","BREADCRUMBS:base"),i.bound("opinionSurveys","BREADCRUMBS:report")],actions:function(){return[{label:i.bound("opinionSurveys","PAGE_ACTION:settings"),icon:"cogs",privileges:"OPINION_SURVEYS:MANAGE",href:"#opinionSurveys;settings?tab=reports"}]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),["responseCount","responseCountByDivision","responseCountBySuperior","responsePercentBySurvey","responsePercentByDivision","answerCountTotal","positiveAnswerPercentBySurvey","positiveAnswerPercentByDivision"].forEach(function(e){this.setView(".opinionSurveys-report-"+e+"-container",this[e+"View"])},this)},defineModels:function(){this.surveys=t(new n(null,{rqlQuery:"sort(-startDate)"}),this),this.query=u.fromQuery(this.options.query),this.report=t(new o(null,{query:this.query}),this),this.listenTo(this.surveys,"reset",this.surveys.buildCacheMaps.bind(this.surveys)),this.listenTo(this.query,"change",this.onQueryChange)},defineViews:function(){var e={model:{surveys:this.surveys,report:this.report}};this.filterView=new h({surveys:this.surveys,query:this.query}),this.responseCountView=new p({model:{surveys:this.surveys,query:this.query,report:this.report}}),this.responseCountByDivisionView=new y(e),this.responseCountBySuperiorView=new v(e),this.responsePercentBySurveyView=new w(e),this.responsePercentByDivisionView=new a(e),this.answerCountTotalView=new c(e),this.positiveAnswerPercentBySurveyView=new l(e),this.positiveAnswerPercentByDivisionView=new f(e)},destroy:function(){r.unload()},load:function(i){if(r.loaded)return i(this.surveys.fetch({reset:!0}),this.report.fetch());var s=this;return r.load().then(function(){return e.when(s.surveys.fetch({reset:!0}),s.report.fetch())})},afterRender:function(){r.load()},onQueryChange:function(e,i){i&&i.reset&&(this.broker.publish("router.navigate",{url:this.report.genClientUrl(),replace:!0,trigger:!1}),this.promised(this.report.fetch()))}})});