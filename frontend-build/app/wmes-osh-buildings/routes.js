define(["underscore","app/router","app/viewport","app/user","app/core/pages/ListPage","app/core/pages/DetailsPage","app/core/pages/AddFormPage","app/core/pages/EditFormPage","app/core/util/showDeleteFormPage","app/wmes-osh-common/dictionaries","./Building","i18n!app/nls/wmes-osh-buildings"],function(i,e,a,s,d,n,o,p,l,m,t){"use strict";var r=s.auth("OSH:DICTIONARIES:VIEW"),g=s.auth("OSH:DICTIONARIES:MANAGE");e.map("/osh/buildings",r,()=>{a.showPage(m.bind(new d({load:null,collection:m.buildings,columns:[{id:"shortName",className:"is-min"},{id:"longName"},{id:"divisions"},{id:"active",className:"is-min"}]})))}),e.map("/osh/buildings/:id",r,i=>{a.loadPage(["app/wmes-osh-buildings/templates/details"],function(e){const a=m.buildings.get(i.params.id);return m.bind(new n({detailsTemplate:e,model:a||new t({_id:i.params.id})}))})}),e.map("/osh/buildings;add",g,()=>{a.loadPage(["app/wmes-osh-buildings/views/FormView"],function(i){return m.bind(new o({FormView:i,model:new t}))})}),e.map("/osh/buildings/:id;edit",g,i=>{a.loadPage(["app/wmes-osh-buildings/views/FormView"],function(e){const a=m.buildings.get(i.params.id);return m.bind(new p({FormView:e,model:a||new t({_id:i.params.id})}))})}),e.map("/osh/buildings/:id;delete",g,i.partial(l,t,i,i,{}))});