// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","./LossReasonCollection","./LossReason","../core/pages/ListPage","../core/pages/DetailsPage","../core/pages/AddFormPage","../core/pages/EditFormPage","../core/pages/ActionFormPage","./views/LossReasonFormView","app/lossReasons/templates/details","i18n!app/nls/lossReasons"],function(e,s,o,a,n,i,l,r,t,d,m,c){var p=o.auth("DICTIONARIES:VIEW"),w=o.auth("DICTIONARIES:MANAGE");e.map("/lossReasons",p,function(e){s.showPage(new i({collection:new a(null,{rqlQuery:e.rql}),columns:["_id","label","position"]}))}),e.map("/lossReasons/:id",function(e){s.showPage(new l({model:new n({_id:e.params.id}),detailsTemplate:c}))}),e.map("/lossReasons;add",w,function(){s.showPage(new r({FormView:m,model:new n}))}),e.map("/lossReasons/:id;edit",w,function(e){s.showPage(new t({FormView:m,model:new n({_id:e.params.id})}))}),e.map("/lossReasons/:id;delete",w,function(e,o){var a=new n({_id:e.params.id});s.showPage(new d({model:a,actionKey:"delete",successUrl:a.genClientUrl("base"),cancelUrl:o||a.genClientUrl("base"),formMethod:"DELETE",formAction:a.url(),formActionSeverity:"danger"}))})});