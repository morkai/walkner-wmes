// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../data/companies","./Company","i18n!app/nls/companies"],function(e,a,n,i,o){"use strict";var p=n.auth("DICTIONARIES:VIEW"),m=n.auth("DICTIONARIES:MANAGE");e.map("/companies",p,function(){a.loadPage(["app/core/pages/ListPage"],function(e){return new e({collection:i,columns:[{id:"_id",className:"is-min"},{id:"name",className:"is-min"},"color"]})})}),e.map("/companies/:id",function(e){a.loadPage(["app/core/pages/DetailsPage","app/companies/templates/details"],function(a,n){return new a({model:new o({_id:e.params.id}),detailsTemplate:n})})}),e.map("/companies;add",m,function(){a.loadPage(["app/core/pages/AddFormPage","app/companies/views/CompanyFormView"],function(e,a){return new e({FormView:a,model:new o})})}),e.map("/companies/:id;edit",m,function(e){a.loadPage(["app/core/pages/EditFormPage","app/companies/views/CompanyFormView"],function(a,n){return new a({FormView:n,model:new o({_id:e.params.id})})})}),e.map("/companies/:id;delete",m,function(e,n){var i=new o({_id:e.params.id});a.loadPage(["app/core/pages/ActionFormPage"],function(e){return new e({model:i,actionKey:"delete",successUrl:i.genClientUrl("base"),cancelUrl:n||i.genClientUrl("base"),formMethod:"DELETE",formAction:i.url(),formActionSeverity:"danger"})})})});