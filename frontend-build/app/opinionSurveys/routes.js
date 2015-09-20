// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage","../core/pages/ListPage","./OpinionSurveyCollection","./OpinionSurvey","./OpinionSurveyReport","./pages/OpinionSurveyDetailsPage","./pages/OpinionSurveyAddFormPage","./pages/OpinionSurveyEditFormPage","./pages/EmployeeCountEditFormPage","./pages/OpinionSurveyReportPage","./views/OpinionSurveyListView","i18n!app/nls/reports","i18n!app/nls/opinionSurveys"],function(e,i,n,o,r,a,p,u,s,t,d,m,l,v,w){"use strict";var y=o.auth();i.map("/opinionSurveyReport",y,function(e){n.showPage(new v({model:new s({from:+e.query.from||void 0,to:+e.query.to||void 0,interval:e.query.interval})}))}),i.map("/opinionSurveys",y,function(e){n.showPage(new a({baseBreadcrumb:!0,ListView:w,collection:new p(null,{rqlQuery:e.rql})}))}),i.map("/opinionSurveys/:id",y,function(e){n.showPage(new t({model:new u({_id:e.params.id})}))}),i.map("/opinionSurveys;add",y,function(){n.showPage(new d({model:new u}))}),i.map("/opinionSurveys/:id;edit",y,function(e){n.showPage(new m({model:new u({_id:e.params.id})}))}),i.map("/opinionSurveys/:id;editEmployeeCount",y,function(e){n.showPage(new l({model:new u({_id:e.params.id})}))}),i.map("/opinionSurveys/:id;delete",y,e.partial(r,u,e,e,{baseBreadcrumb:!0}))});