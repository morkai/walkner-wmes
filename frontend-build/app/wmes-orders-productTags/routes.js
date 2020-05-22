define(["underscore","../router","../viewport","../i18n","../user","../core/View","../core/util/showDeleteFormPage"],function(e,a,r,o,d,s,t){"use strict";var i="app/wmes-orders-productTags",n="i18n!app/nls/wmes-orders-productTags",u=d.auth("ORDERS:MANAGE"),p=u;a.map("/productTags",u,function(e){r.loadPage(["app/core/pages/ListPage",i+"/ProductTagCollection",i+"/views/ListView",n],function(a,r,o){return new a({navbarModuleName:"orders",baseBreadcrumb:"#orders",pageClassName:"page-max-flex",ListView:o,collection:new r(null,{rqlQuery:e.rql})})})}),a.map("/productTags/:id",function(e){r.loadPage(["app/core/pages/DetailsPage",i+"/ProductTag",i+"/templates/details",n],function(a,r,o){return new a({navbarModuleName:"orders",baseBreadcrumb:"#orders",pageClassName:"page-max-flex",detailsTemplate:o,model:new r({_id:e.params.id})})})}),a.map("/productTags;add",p,function(){r.loadPage(["app/core/pages/AddFormPage",i+"/ProductTag",i+"/views/FormView",n],function(e,a,r){return new e({navbarModuleName:"orders",baseBreadcrumb:"#orders",pageClassName:"page-max-flex",FormView:r,model:new a})})}),a.map("/productTags/:id;edit",function(e){r.loadPage(["app/core/pages/EditFormPage",i+"/ProductTag",i+"/views/FormView",n],function(a,r,o){return new a({navbarModuleName:"orders",baseBreadcrumb:"#orders",pageClassName:"page-max-flex",FormView:o,model:new r({_id:e.params.id})})})}),a.map("/productTags/:id;delete",p,e.partial(t,i+"/ProductTag",e,e,{navbarModuleName:"orders",baseBreadcrumb:"#orders"}))});