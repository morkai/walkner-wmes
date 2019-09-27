define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/workCenters","./WorkCenter"],function(e,r,n,o,t,a){"use strict";var i="i18n!app/nls/workCenters",p=n.auth("DICTIONARIES:VIEW"),s=n.auth("DICTIONARIES:MANAGE");e.map("/workCenters",p,function(){r.loadPage(["app/workCenters/pages/WorkCenterListPage",i],function(e){return new e({collection:t})})}),e.map("/workCenters/:id",function(e){r.loadPage(["app/workCenters/pages/WorkCenterDetailsPage",i],function(r){return new r({model:new a({_id:e.params.id})})})}),e.map("/workCenters;add",s,function(){r.loadPage(["app/core/pages/AddFormPage","app/workCenters/views/WorkCenterFormView",i],function(e,r){return new e({FormView:r,model:new a})})}),e.map("/workCenters/:id;edit",s,function(e){r.loadPage(["app/core/pages/EditFormPage","app/workCenters/views/WorkCenterFormView",i],function(r,n){return new r({FormView:n,model:new a({_id:e.params.id})})})}),e.map("/workCenters/:id;delete",s,o.bind(null,a))});