// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage","./KaizenAreaCollection","./KaizenArea","../core/pages/ListPage","../core/pages/DetailsPage","../core/pages/AddFormPage","../core/pages/EditFormPage","../core/pages/ActionFormPage","./views/KaizenAreaFormView","app/kaizenAreas/templates/details","i18n!app/nls/kaizenAreas"],function(e,a,r,i,n,s,o,d,m,t,c,l,p,u){"use strict";var w=i.auth("KAIZEN:DICTIONARIES:VIEW"),g=i.auth("KAIZEN:DICTIONARIES:MANAGE");a.map("/kaizen/areas",w,function(e){r.showPage(new d({baseBreadcrumb:!0,collection:new s(null,{rqlQuery:e.rql}),columns:[{id:"_id",className:"is-min"},"name"]}))}),a.map("/kaizen/areas/:id",function(e){r.showPage(new m({baseBreadcrumb:!0,model:new o({_id:e.params.id}),detailsTemplate:u}))}),a.map("/kaizen/areas;add",g,function(){r.showPage(new t({baseBreadcrumb:!0,FormView:p,model:new o}))}),a.map("/kaizen/areas/:id;edit",g,function(e){r.showPage(new c({baseBreadcrumb:!0,FormView:p,model:new o({_id:e.params.id})}))}),a.map("/kaizen/areas/:id;delete",g,e.partial(n,o,e,e,{baseBreadcrumb:!0}))});