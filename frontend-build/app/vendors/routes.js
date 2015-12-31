// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","./VendorCollection","./Vendor","i18n!app/nls/vendors"],function(e,n,o,a,r,d){"use strict";var i=o.auth("DICTIONARIES:VIEW"),t=o.auth("DICTIONARIES:MANAGE");e.map("/vendors",i,function(e){n.loadPage(["app/core/pages/ListPage"],function(n){return new n({collection:new r({rqlQuery:e.rql}),columns:["_id","name"]})})}),e.map("/vendors/:id",function(e){n.loadPage(["app/core/pages/DetailsPage","app/vendors/templates/details"],function(n,o){return new n({detailsTemplate:o,model:new d({_id:e.params.id})})})}),e.map("/vendors;add",t,function(){n.loadPage(["app/core/pages/AddFormPage","app/vendors/views/VendorFormView"],function(e,n){return new e({FormView:n,model:new d})})}),e.map("/vendors/:id;edit",t,function(e){n.loadPage(["app/core/pages/EditFormPage","app/vendors/views/VendorFormView"],function(n,o){return new n({FormView:o,model:new d({_id:e.params.id})})})}),e.map("/vendors/:id;delete",t,a.bind(null,d))});