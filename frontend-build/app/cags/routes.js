// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","./Cag"],function(e,a,r,t,n,o){"use strict";var p="i18n!app/nls/cags",s=r.auth("REPORTS:VIEW","REPORTS:9:VIEW"),c=r.auth("REPORTS:MANAGE");e.map("/cags",s,function(e){a.loadPage(["app/core/pages/ListPage","app/cags/CagCollection",p],function(a,r){return new a({baseBreadcrumb:"#reports/9",collection:new r(null,{rqlQuery:e.rql}),columns:[{id:"_id",className:"is-min"},"name"]})})}),e.map("/cags/:id",function(e){a.loadPage(["app/core/pages/DetailsPage","app/cags/templates/details",p],function(a,r){return new a({baseBreadcrumb:"#reports/9",model:new o({_id:e.params.id}),detailsTemplate:r})})}),e.map("/cags;add",c,function(){a.loadPage(["app/core/pages/AddFormPage","app/cags/templates/form",p],function(e,a){return new e({baseBreadcrumb:"#reports/9",model:new o,formTemplate:a})})}),e.map("/cags/:id;edit",c,function(e){a.loadPage(["app/core/pages/EditFormPage","app/cags/templates/form",p],function(a,r){return new a({baseBreadcrumb:"#reports/9",model:new o({_id:e.params.id}),formTemplate:r})})}),e.map("/cags/:id;delete",c,t.bind(null,o))});