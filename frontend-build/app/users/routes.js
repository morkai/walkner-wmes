define(["../router","../viewport","../user","./User","./UserCollection","../core/pages/DetailsPage","../core/pages/AddFormPage","../core/pages/EditFormPage","../core/pages/ActionFormPage","./pages/UserListPage","./views/UserDetailsView","./views/UserFormView","i18n!app/nls/users"],function(e,t,n,r,i,o,a,s,l,d,u,c){var p=n.auth("USERS:VIEW"),f=n.auth("USERS:MANAGE");e.map("/users",p,function(e){t.showPage(new d({rql:e.rql}))}),e.map("/users/:id",function(e,t,r){e.params.id===n.data._id?r():p(e,t,r)},function(e){t.showPage(new o({DetailsView:u,model:new r({_id:e.params.id})}))}),e.map("/users;add",f,function(){t.showPage(new a({FormView:c,model:new r}))}),e.map("/users/:id;edit",f,function(e){t.showPage(new s({FormView:c,model:new r({_id:e.params.id})}))}),e.map("/users/:id;delete",f,function(e,n){var i=new r({_id:e.params.id});t.showPage(new l({model:i,actionKey:"delete",successUrl:i.genClientUrl("base"),cancelUrl:n||i.genClientUrl("base"),formMethod:"DELETE",formAction:i.url(),formActionSeverity:"danger"}))})});