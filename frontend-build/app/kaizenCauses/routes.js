define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(e,a,s,i,n){"use strict";var u="i18n!app/nls/kaizenCauses",r=i.auth("KAIZEN:DICTIONARIES:VIEW"),p=i.auth("KAIZEN:DICTIONARIES:MANAGE");a.map("/kaizenCauses",r,function(e){s.loadPage(["app/core/pages/ListPage","app/kaizenCauses/KaizenCauseCollection",u],function(a,s){return new a({baseBreadcrumb:!0,collection:new s(null,{rqlQuery:e.rql}),columns:[{id:"_id",className:"is-min"},"name",{id:"position",className:"is-min"}]})})}),a.map("/kaizenCauses/:id",r,function(e){s.loadPage(["app/core/pages/DetailsPage","app/kaizenCauses/KaizenCause","app/kaizenCauses/templates/details",u],function(a,s,i){return new a({baseBreadcrumb:!0,model:new s({_id:e.params.id}),detailsTemplate:i})})}),a.map("/kaizenCauses;add",p,function(){s.loadPage(["app/core/pages/AddFormPage","app/kaizenCauses/KaizenCause","app/kaizenCauses/views/KaizenCauseFormView",u],function(e,a,s){return new e({baseBreadcrumb:!0,FormView:s,model:new a})})}),a.map("/kaizenCauses/:id;edit",p,function(e){s.loadPage(["app/core/pages/EditFormPage","app/kaizenCauses/KaizenCause","app/kaizenCauses/views/KaizenCauseFormView",u],function(a,s,i){return new a({baseBreadcrumb:!0,FormView:i,model:new s({_id:e.params.id})})})}),a.map("/kaizenCauses/:id;delete",p,e.partial(n,"app/kaizenCauses/KaizenCause",e,e,{baseBreadcrumb:!0}))});