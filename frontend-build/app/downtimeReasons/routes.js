// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../data/downtimeReasons","./DowntimeReason","../core/pages/ListPage","../core/pages/DetailsPage","../core/pages/AddFormPage","../core/pages/EditFormPage","../core/pages/ActionFormPage","./views/DowntimeReasonFormView","app/downtimeReasons/templates/details","i18n!app/nls/downtimeReasons"],function(e,o,n,a,i,s,t,d,r,m,l,w){var c=n.auth("DICTIONARIES:VIEW"),p=n.auth("DICTIONARIES:MANAGE");e.map("/downtimeReasons",c,function(){o.showPage(new s({collection:a,columns:["_id","label","type","subdivisionTypes","opticsPosition","pressPosition","auto","scheduled","color","refColor","refValue"]}))}),e.map("/downtimeReasons/:id",function(e){o.showPage(new t({model:new i({_id:e.params.id}),detailsTemplate:w}))}),e.map("/downtimeReasons;add",p,function(){o.showPage(new d({FormView:l,model:new i}))}),e.map("/downtimeReasons/:id;edit",p,function(e){o.showPage(new r({FormView:l,model:new i({_id:e.params.id})}))}),e.map("/downtimeReasons/:id;delete",p,function(e,n){var a=new i({_id:e.params.id});o.showPage(new m({model:a,actionKey:"delete",successUrl:a.genClientUrl("base"),cancelUrl:n||a.genClientUrl("base"),formMethod:"DELETE",formAction:a.url(),formActionSeverity:"danger"}))})});