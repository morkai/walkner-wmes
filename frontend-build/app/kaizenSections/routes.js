define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(e,i,a,n,o){"use strict";var t="i18n!app/nls/kaizenSections",s=n.auth("KAIZEN:DICTIONARIES:VIEW"),c=n.auth("KAIZEN:DICTIONARIES:MANAGE");i.map("/kaizenSections",s,function(e){a.loadPage(["app/core/pages/ListPage","app/kaizenSections/KaizenSectionCollection",t],function(i,a){return new i({baseBreadcrumb:!0,collection:new a(null,{rqlQuery:e.rql}),columns:[{id:"position",className:"is-min",tdClassName:"is-number"},{id:"_id",className:"is-min"},{id:"name",className:"is-min"},{id:"subdivisions"}]})})}),i.map("/kaizenSections/:id",s,function(e){a.loadPage(["app/core/pages/DetailsPage","app/kaizenSections/KaizenSection","app/kaizenSections/templates/details",t],function(i,a,n){return new i({baseBreadcrumb:!0,model:new a({_id:e.params.id}),detailsTemplate:n})})}),i.map("/kaizenSections;add",c,function(){a.loadPage(["app/core/pages/AddFormPage","app/kaizenSections/KaizenSection","app/kaizenSections/views/KaizenSectionFormView",t],function(e,i,a){return new e({baseBreadcrumb:!0,FormView:a,model:new i})})}),i.map("/kaizenSections/:id;edit",c,function(e){a.loadPage(["app/core/pages/EditFormPage","app/kaizenSections/KaizenSection","app/kaizenSections/views/KaizenSectionFormView",t],function(i,a,n){return new i({baseBreadcrumb:!0,FormView:n,model:new a({_id:e.params.id})})})}),i.map("/kaizenSections/:id;delete",c,e.partial(o,"app/kaizenSections/KaizenSection",e,e,{baseBreadcrumb:!0}))});