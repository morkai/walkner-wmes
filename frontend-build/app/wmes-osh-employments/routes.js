define(["underscore","app/router","app/viewport","app/user","app/core/pages/ListPage","app/core/pages/DetailsPage","app/core/pages/AddFormPage","app/core/pages/EditFormPage","app/core/util/showDeleteFormPage","app/wmes-osh-common/dictionaries","./Employment","./EmploymentCollection","i18n!app/nls/wmes-osh-employments"],function(e,s,m,a,o,i,p,n,l,t,r,d){"use strict";const w=a.auth("OSH:HR:VIEW"),c=a.auth("OSH:HR:MANAGE");s.map("/osh/employments",w,e=>{m.showPage(t.bind(new o({collection:new d(null,{rqlQuery:e.rql}),columns:[{id:"month",className:"is-min"},{id:"internal",className:"is-min is-number"},{id:"external",className:"is-min is-number"},{id:"absent",className:"is-min is-number"},{id:"total",className:"is-min is-number"},{id:"observers",className:"is-min is-number"},"-"]})))}),s.map("/osh/employments/:id",w,e=>{m.loadPage(["app/wmes-osh-employments/views/DetailsView","css!app/wmes-osh-employments/assets/details"],s=>t.bind(new i({DetailsView:s,model:new r({_id:e.params.id})})))}),s.map("/osh/employments;add",c,()=>{m.loadPage(["app/wmes-osh-employments/views/FormView","css!app/wmes-osh-employments/assets/form"],e=>t.bind(new p({FormView:e,model:new r})))}),s.map("/osh/employments/:id;edit",c,e=>{m.loadPage(["app/wmes-osh-employments/views/FormView","css!app/wmes-osh-employments/assets/form"],s=>t.bind(new n({FormView:s,model:new r({_id:e.params.id})})))}),s.map("/osh/employments/:id;delete",c,e.partial(l,r,e,e,{}))});