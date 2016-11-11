// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(e,a,i,r,n){"use strict";var s="i18n!app/nls/kaizenAreas",p=r.auth("KAIZEN:DICTIONARIES:VIEW"),o=r.auth("KAIZEN:DICTIONARIES:MANAGE");a.map("/kaizenAreas",p,function(e){i.loadPage(["app/core/pages/ListPage","app/kaizenAreas/KaizenAreaCollection",s],function(a,i){return new a({baseBreadcrumb:!0,collection:new i(null,{rqlQuery:e.rql}),columns:[{id:"_id",className:"is-min"},"name",{id:"position",className:"is-min"}]})})}),a.map("/kaizenAreas/:id",p,function(e){i.loadPage(["app/core/pages/DetailsPage","app/kaizenAreas/KaizenArea","app/kaizenAreas/templates/details",s],function(a,i,r){return new a({baseBreadcrumb:!0,model:new i({_id:e.params.id}),detailsTemplate:r})})}),a.map("/kaizenAreas;add",o,function(){i.loadPage(["app/core/pages/AddFormPage","app/kaizenAreas/KaizenArea","app/kaizenAreas/views/KaizenAreaFormView",s],function(e,a,i){return new e({baseBreadcrumb:!0,FormView:i,model:new a})})}),a.map("/kaizenAreas/:id;edit",o,function(e){i.loadPage(["app/core/pages/EditFormPage","app/kaizenAreas/KaizenArea","app/kaizenAreas/views/KaizenAreaFormView",s],function(a,i,r){return new a({baseBreadcrumb:!0,FormView:r,model:new i({_id:e.params.id})})})}),a.map("/kaizenAreas/:id;delete",o,e.partial(n,"app/kaizenAreas/KaizenArea",e,e,{baseBreadcrumb:!0}))});