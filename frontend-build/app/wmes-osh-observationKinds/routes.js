define(["underscore","app/router","app/viewport","app/user","app/core/pages/ListPage","app/core/pages/DetailsPage","app/core/pages/AddFormPage","app/core/pages/EditFormPage","app/core/util/showDeleteFormPage","app/wmes-osh-common/dictionaries","./ObservationKind","./ObservationKindCollection","i18n!app/nls/wmes-osh-observationKinds"],function(e,a,i,s,o,n,d,t,r,p,m){"use strict";var l=s.auth("OSH:DICTIONARIES:VIEW"),w=s.auth("OSH:DICTIONARIES:MANAGE");a.map("/osh/observationKinds",l,()=>{i.showPage(p.bind(new o({load:null,collection:p.observationKinds,columns:[{id:"shortName",className:"is-min"},{id:"longName"},{id:"position",className:"is-min"},{id:"active",className:"is-min"}]})))}),a.map("/osh/observationKinds/:id",l,e=>{i.loadPage(["app/wmes-osh-observationKinds/templates/details"],a=>{const i=p.observationKinds.get(e.params.id);return p.bind(new n({detailsTemplate:a,model:i||new m({_id:e.params.id})}))})}),a.map("/osh/observationKinds;add",w,()=>{i.loadPage(["app/wmes-osh-observationKinds/views/FormView"],e=>p.bind(new d({FormView:e,model:new m})))}),a.map("/osh/observationKinds/:id;edit",w,e=>{i.loadPage(["app/wmes-osh-observationKinds/views/FormView"],a=>{const i=p.observationKinds.get(e.params.id);return p.bind(new t({FormView:a,model:i||new m({_id:e.params.id})}))})}),a.map("/osh/observationKinds/:id;delete",w,e.partial(r,m,e,e,{}))});