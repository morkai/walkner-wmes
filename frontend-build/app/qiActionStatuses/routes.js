define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(t,a,e,i,s){"use strict";var n="i18n!app/nls/qiActionStatuses",o=i.auth("QI:DICTIONARIES:VIEW"),u=i.auth("QI:DICTIONARIES:MANAGE");a.map("/qi/actionStatuses",o,function(t){e.loadPage(["app/core/pages/ListPage","app/qiActionStatuses/QiActionStatusCollection",n],function(a,e){return new a({baseBreadcrumb:!0,collection:new e(null,{rqlQuery:t.rql}),columns:[{id:"_id",className:"is-min"},{id:"name",className:"is-min"},"position"]})})}),a.map("/qi/actionStatuses/:id",o,function(t){e.loadPage(["app/core/pages/DetailsPage","app/qiActionStatuses/QiActionStatus","app/qiActionStatuses/templates/details",n],function(a,e,i){return new a({baseBreadcrumb:!0,model:new e({_id:t.params.id}),detailsTemplate:i})})}),a.map("/qi/actionStatuses;add",u,function(){e.loadPage(["app/core/pages/AddFormPage","app/qiActionStatuses/QiActionStatus","app/qiActionStatuses/views/QiActionStatusFormView",n],function(t,a,e){return new t({baseBreadcrumb:!0,FormView:e,model:new a})})}),a.map("/qi/actionStatuses/:id;edit",u,function(t){e.loadPage(["app/core/pages/EditFormPage","app/qiActionStatuses/QiActionStatus","app/qiActionStatuses/views/QiActionStatusFormView",n],function(a,e,i){return new a({baseBreadcrumb:!0,FormView:i,model:new e({_id:t.params.id})})})}),a.map("/qi/actionStatuses/:id;delete",u,t.partial(s,"app/qiActionStatuses/QiActionStatus",t,t,{baseBreadcrumb:!0}))});