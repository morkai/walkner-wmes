// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage","./KaizenCauseCollection","./KaizenCause","../core/pages/ListPage","../core/pages/DetailsPage","../core/pages/AddFormPage","../core/pages/EditFormPage","../core/pages/ActionFormPage","./views/KaizenCauseFormView","app/kaizenCauses/templates/details","i18n!app/nls/kaizenCauses"],function(e,a,s,i,n,o,r,m,u,d,t,c,l,p){"use strict";var w=i.auth("KAIZEN:DICTIONARIES:VIEW"),g=i.auth("KAIZEN:DICTIONARIES:MANAGE");a.map("/kaizenCauses",w,function(e){s.showPage(new m({baseBreadcrumb:!0,collection:new o(null,{rqlQuery:e.rql}),columns:[{id:"_id",className:"is-min"},"name",{id:"position",className:"is-min"}]}))}),a.map("/kaizenCauses/:id",w,function(e){s.showPage(new u({baseBreadcrumb:!0,model:new r({_id:e.params.id}),detailsTemplate:p}))}),a.map("/kaizenCauses;add",g,function(){s.showPage(new d({baseBreadcrumb:!0,FormView:l,model:new r}))}),a.map("/kaizenCauses/:id;edit",g,function(e){s.showPage(new t({baseBreadcrumb:!0,FormView:l,model:new r({_id:e.params.id})}))}),a.map("/kaizenCauses/:id;delete",g,e.partial(n,r,e,e,{baseBreadcrumb:!0}))});