// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../i18n","../router","../viewport","../user","../core/View","../core/util/showDeleteFormPage","./User","./pages/LogInFormPage","i18n!app/nls/users"],function(e,a,n,s,r,i,t,u){"use strict";var o=s.auth("USERS:VIEW"),p=s.auth("USERS:MANAGE");a.map("/login",function(){n.showPage(new u)}),a.map("/users;settings",s.auth("USERS:MANAGE"),function(e){n.loadPage(["app/users/pages/UserSettingsPage"],function(a){return new a({initialTab:e.query.tab})})}),a.map("/users",o,function(e){n.loadPage(["app/users/pages/UserListPage"],function(a){return new a({rql:e.rql})})}),a.map("/users/:id",function(e,a,n){e.params.id===s.data._id?n():o(e,a,n)},function(e){n.loadPage(["app/users/pages/UserDetailsPage"],function(a){return new a({model:new t({_id:e.params.id})})})}),a.map("/users;add",p,function(){n.loadPage(["app/core/pages/AddFormPage","app/users/views/UserFormView"],function(e,a){return new e({FormView:a,model:new t})})}),a.map("/users/:id;edit",function(e,a,n){e.params.id===s.data._id?n():p(e,a,n)},function(e){n.loadPage(["app/users/pages/UserEditFormPage"],function(a){return new a({model:new t({_id:e.params.id})})})}),a.map("/users/:id;delete",p,i.bind(null,t))});