// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../i18n","../user","../core/util/showDeleteFormPage","../data/divisions","./Division","i18n!app/nls/divisions"],function(i,e,n,o,a,s,d){var t=o.auth("DICTIONARIES:VIEW"),p=o.auth("DICTIONARIES:MANAGE");i.map("/divisions",t,function(){e.loadPage(["app/core/pages/ListPage"],function(i){return new i({collection:s,columns:[{id:"_id",className:"is-min"},{id:"type",className:"is-min"},"description"],serializeRow:function(i){var e=i.toJSON();return e.type=n("divisions","TYPE:"+e.type),e}})})}),i.map("/divisions/:id",function(i){e.loadPage(["app/core/pages/DetailsPage","app/divisions/templates/details"],function(e,n){return new e({model:new d({_id:i.params.id}),detailsTemplate:n})})}),i.map("/divisions;add",p,function(){e.loadPage(["app/core/pages/AddFormPage","app/divisions/views/DivisionFormView"],function(i,e){return new i({FormView:e,model:new d})})}),i.map("/divisions/:id;edit",p,function(i){e.loadPage(["app/core/pages/EditFormPage","app/divisions/views/DivisionFormView"],function(e,n){return new e({FormView:n,model:new d({_id:i.params.id})})})}),i.map("/divisions/:id;delete",p,a.bind(null,d))});