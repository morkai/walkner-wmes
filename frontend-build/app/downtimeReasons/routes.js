// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../data/downtimeReasons","./DowntimeReason","../core/pages/ListPage","../core/pages/DetailsPage","../core/pages/AddFormPage","../core/pages/EditFormPage","../core/pages/ActionFormPage","./views/DowntimeReasonFormView","app/downtimeReasons/templates/details","i18n!app/nls/downtimeReasons"],function(e,o,a,n,s,i,t,d,r,m,l,w){"use strict";var c=a.auth("DICTIONARIES:VIEW"),p=a.auth("DICTIONARIES:MANAGE");e.map("/downtimeReasons",c,function(){o.showPage(new i({collection:n,columns:["_id","label","type","defaultAor","subdivisionTypes","aors","opticsPosition","pressPosition","auto","scheduled","color","refColor","refValue"]}))}),e.map("/downtimeReasons/:id",function(e){o.showPage(new t({model:new s({_id:e.params.id}),detailsTemplate:w}))}),e.map("/downtimeReasons;add",p,function(){o.showPage(new d({FormView:l,model:new s}))}),e.map("/downtimeReasons/:id;edit",p,function(e){o.showPage(new r({FormView:l,model:new s({_id:e.params.id})}))}),e.map("/downtimeReasons/:id;delete",p,function(e,a){var n=new s({_id:e.params.id});o.showPage(new m({model:n,actionKey:"delete",successUrl:n.genClientUrl("base"),cancelUrl:a||n.genClientUrl("base"),formMethod:"DELETE",formAction:n.url(),formActionSeverity:"danger"}))})});