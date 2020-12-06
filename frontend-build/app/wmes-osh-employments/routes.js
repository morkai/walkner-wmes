define(["underscore","app/router","app/viewport","app/user","app/core/pages/ListPage","app/core/pages/DetailsPage","app/core/pages/AddFormPage","app/core/pages/EditFormPage","app/core/util/showDeleteFormPage","app/wmes-osh-common/dictionaries","./Employment","./EmploymentCollection","i18n!app/nls/wmes-osh-employments"],function(e,o,m,s,a,p,i,n,l,t,d,r){"use strict";const w=s.auth("OSH:HR:VIEW"),c=s.auth("OSH:HR:MANAGE");o.map("/osh/employments",w,e=>{m.showPage(t.bind(new a({collection:new r(null,{rqlQuery:e.rql}),columns:[{id:"month",className:"is-min"},{id:"count",className:"is-min is-number"},"-"]})))}),o.map("/osh/employments/:id",w,e=>{m.loadPage(["app/wmes-osh-employments/templates/details"],o=>t.bind(new p({detailsTemplate:o,model:new d({_id:e.params.id})})))}),o.map("/osh/employments;add",c,()=>{m.loadPage(["app/wmes-osh-employments/views/FormView"],e=>t.bind(new i({FormView:e,model:new d})))}),o.map("/osh/employments/:id;edit",c,e=>{m.loadPage(["app/wmes-osh-employments/views/FormView"],o=>t.bind(new n({FormView:o,model:new d({_id:e.params.id})})))}),o.map("/osh/employments/:id;delete",c,e.partial(l,d,e,e,{}))});