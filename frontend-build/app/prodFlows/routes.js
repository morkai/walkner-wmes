define(["../router","../viewport","../user","../data/prodFlows","./ProdFlow","../core/pages/ListPage","../core/pages/DetailsPage","../core/pages/AddFormPage","../core/pages/EditFormPage","../core/pages/ActionFormPage","./views/ProdFlowListView","./views/ProdFlowDetailsView","./views/ProdFlowFormView","i18n!app/nls/prodFlows"],function(e,t,n,r,i,o,a,s,l,u,d,c,p){var f=n.auth("DICTIONARIES:VIEW"),h=n.auth("DICTIONARIES:MANAGE");e.map("/prodFlows",f,function(){t.showPage(new o({ListView:d,collection:r}))}),e.map("/prodFlows/:id",function(e){t.showPage(new a({DetailsView:c,model:new i({_id:e.params.id})}))}),e.map("/prodFlows;add",h,function(){t.showPage(new s({FormView:p,model:new i}))}),e.map("/prodFlows/:id;edit",h,function(e){t.showPage(new l({FormView:p,model:new i({_id:e.params.id})}))}),e.map("/prodFlows/:id;delete",h,function(e,n){var r=new i({_id:e.params.id});t.showPage(new u({model:r,actionKey:"delete",successUrl:r.genClientUrl("base"),cancelUrl:n||r.genClientUrl("base"),formMethod:"DELETE",formAction:r.url(),formActionSeverity:"danger"}))})});