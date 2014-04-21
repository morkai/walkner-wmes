// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/workCenters","./WorkCenter","i18n!app/nls/workCenters"],function(e,r,n,o,t,a){var i=n.auth("DICTIONARIES:VIEW"),w=n.auth("DICTIONARIES:MANAGE");e.map("/workCenters",i,function(){r.loadPage(["app/core/pages/ListPage","app/workCenters/views/WorkCenterListView"],function(e,r){return new e({ListView:r,collection:t})})}),e.map("/workCenters/:id",function(e){r.loadPage(["app/core/pages/DetailsPage","app/workCenters/views/WorkCenterDetailsView"],function(r,n){return new r({DetailsView:n,model:new a({_id:e.params.id})})})}),e.map("/workCenters;add",w,function(){r.loadPage(["app/core/pages/AddFormPage","app/workCenters/views/WorkCenterFormView"],function(e,r){return new e({FormView:r,model:new a})})}),e.map("/workCenters/:id;edit",w,function(e){r.loadPage(["app/core/pages/EditFormPage","app/workCenters/views/WorkCenterFormView"],function(r,n){return new r({FormView:n,model:new a({_id:e.params.id})})})}),e.map("/workCenters/:id;delete",w,o.bind(null,a))});