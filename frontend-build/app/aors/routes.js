define(["../router","../viewport","../user","../data/aors","./Aor","../core/pages/ListPage","../core/pages/DetailsPage","../core/pages/AddFormPage","../core/pages/EditFormPage","../core/views/FormView","../core/pages/ActionFormPage","app/aors/templates/details","app/aors/templates/form","i18n!app/nls/aors"],function(e,a,o,r,n,s,i,t,m,d,l,p,c){var g=o.auth("DICTIONARIES:VIEW"),w=o.auth("DICTIONARIES:MANAGE");e.map("/aors",g,function(){a.showPage(new s({collection:r,columns:["name","description"]}))}),e.map("/aors/:id",function(e){a.showPage(new i({model:new n({_id:e.params.id}),detailsTemplate:p}))}),e.map("/aors;add",w,function(){a.showPage(new t({model:new n,formTemplate:c}))}),e.map("/aors/:id;edit",w,function(e){a.showPage(new m({model:new n({_id:e.params.id}),formTemplate:c}))}),e.map("/aors/:id;delete",w,function(e,o){var r=new n({_id:e.params.id});a.showPage(new l({model:r,actionKey:"delete",successUrl:r.genClientUrl("base"),cancelUrl:o||r.genClientUrl("base"),formMethod:"DELETE",formAction:r.url(),formActionSeverity:"danger"}))})});