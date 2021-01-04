define(["underscore","app/router","app/viewport","app/user","app/core/pages/ListPage","app/core/pages/DetailsPage","app/core/pages/AddFormPage","app/core/pages/EditFormPage","app/core/util/showDeleteFormPage","app/wmes-osh-common/dictionaries","./Department","./DepartmentCollection","i18n!app/nls/wmes-osh-departments"],function(e,a,s,t,p,m,d,i,o,r,n){"use strict";var l=t.auth("OSH:DICTIONARIES:VIEW"),w=t.auth("OSH:DICTIONARIES:MANAGE");a.map("/osh/departments",l,()=>{s.showPage(r.bind(new p({load:null,collection:r.departments,columns:[{id:"workplace",className:"is-min"},{id:"shortName",className:"is-min"},{id:"longName"},{id:"active",className:"is-min"}]})))}),a.map("/osh/departments/:id",l,e=>{s.loadPage(["app/wmes-osh-departments/templates/details"],a=>{const s=r.departments.get(e.params.id);return r.bind(new m({detailsTemplate:a,model:s||new n({_id:e.params.id})}))})}),a.map("/osh/departments;add",w,()=>{s.loadPage(["app/wmes-osh-departments/views/FormView"],e=>r.bind(new d({FormView:e,model:new n})))}),a.map("/osh/departments/:id;edit",w,e=>{s.loadPage(["app/wmes-osh-departments/views/FormView"],a=>{const s=r.departments.get(e.params.id);return r.bind(new i({FormView:a,model:s||new n({_id:e.params.id})}))})}),a.map("/osh/departments/:id;delete",w,e.partial(o,n,e,e,{}))});