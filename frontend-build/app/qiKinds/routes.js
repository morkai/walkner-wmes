// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../router","../viewport","../user","../core/util/showDeleteFormPage","./QiKind"],function(i,e,a,n,d,r,s){"use strict";var o="i18n!app/nls/qiKinds",p=d.auth("QI:DICTIONARIES:VIEW"),t=d.auth("QI:DICTIONARIES:MANAGE");a.map("/qi/kinds",p,function(i){n.loadPage(["app/core/pages/ListPage","app/qiKinds/QiKindCollection",o],function(e,a){return new e({baseBreadcrumb:!0,collection:new a(null,{rqlQuery:i.rql}),columns:[{id:"name",className:"is-min"},{id:"division"},{id:"order",className:"is-min"}]})})}),a.map("/qi/kinds/:id",p,function(i){n.loadPage(["app/core/pages/DetailsPage","app/qiKinds/QiKind","app/qiKinds/templates/details",o],function(e,a,n){return new e({baseBreadcrumb:!0,model:new a({_id:i.params.id}),detailsTemplate:n})})}),a.map("/qi/kinds;add",t,function(){n.loadPage(["app/core/pages/AddFormPage","app/qiKinds/QiKind","app/qiKinds/views/QiKindFormView",o],function(i,e,a){return new i({baseBreadcrumb:!0,FormView:a,model:new e})})}),a.map("/qi/kinds/:id;edit",t,function(i){n.loadPage(["app/core/pages/EditFormPage","app/qiKinds/QiKind","app/qiKinds/views/QiKindFormView",o],function(e,a,n){return new e({baseBreadcrumb:!0,FormView:n,model:new a({_id:i.params.id})})})}),a.map("/qi/kinds/:id;delete",t,i.partial(r,s,i,i,{baseBreadcrumb:!0}))});