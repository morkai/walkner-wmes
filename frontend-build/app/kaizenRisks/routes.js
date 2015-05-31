// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage","./KaizenRiskCollection","./KaizenRisk","../core/pages/ListPage","../core/pages/DetailsPage","../core/pages/AddFormPage","../core/pages/EditFormPage","../core/pages/ActionFormPage","./views/KaizenRiskFormView","app/kaizenRisks/templates/details","i18n!app/nls/kaizenRisks"],function(e,a,i,s,r,n,o,m,d,t,c,l,p,u){"use strict";var w=s.auth("KAIZEN:DICTIONARIES:VIEW"),k=s.auth("KAIZEN:DICTIONARIES:MANAGE");a.map("/kaizen/risks",w,function(e){i.showPage(new m({baseBreadcrumb:!0,collection:new n(null,{rqlQuery:e.rql}),columns:[{id:"_id",className:"is-min"},"name",{id:"position",className:"is-min"}]}))}),a.map("/kaizen/risks/:id",w,function(e){i.showPage(new d({baseBreadcrumb:!0,model:new o({_id:e.params.id}),detailsTemplate:u}))}),a.map("/kaizen/risks;add",k,function(){i.showPage(new t({baseBreadcrumb:!0,FormView:p,model:new o}))}),a.map("/kaizen/risks/:id;edit",k,function(e){i.showPage(new c({baseBreadcrumb:!0,FormView:p,model:new o({_id:e.params.id})}))}),a.map("/kaizen/risks/:id;delete",k,e.partial(r,o,e,e,{baseBreadcrumb:!0}))});