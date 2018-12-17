define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage","./CategoryCollection","./Category"],function(e,a,r,i,s,p,t){"use strict";var n="i18n!app/nls/wmes-fap-categories",o=i.auth("FAP:MANAGE"),c=o;a.map("/fap/categories",o,function(e){r.loadPage(["app/core/pages/ListPage",n],function(a){return new a({baseBreadcrumb:"#fap/entries",collection:new p(null,{rqlQuery:e.rql}),columns:[{id:"name",className:"is-min"},{id:"active",className:"is-min"},"-"]})})}),a.map("/fap/categories/:id",function(e){r.loadPage(["app/core/pages/DetailsPage","app/wmes-fap-categories/templates/details",n],function(a,r){return new a({baseBreadcrumb:"#fap/entries",model:new t({_id:e.params.id}),detailsTemplate:r})})}),a.map("/fap/categories;add",c,function(){r.loadPage(["app/core/pages/AddFormPage","app/wmes-fap-categories/views/FormView","i18n!app/nls/users",n],function(e,a){return new e({baseBreadcrumb:"#fap/entries",FormView:a,model:new t})})}),a.map("/fap/categories/:id;edit",c,function(e){r.loadPage(["app/core/pages/EditFormPage","app/wmes-fap-categories/views/FormView","i18n!app/nls/users",n],function(a,r){return new a({baseBreadcrumb:"#fap/entries",FormView:r,model:new t({_id:e.params.id})})})}),a.map("/fap/categories/:id;delete",c,e.partial(s,"app/wmes-fap-categories/Category",e,e,{baseBreadcrumb:"#fap/entries"}))});