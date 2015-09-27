// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/mrpControllers","./MrpController","i18n!app/nls/mrpControllers"],function(r,e,o,n,l,t){"use strict";var p=o.auth("DICTIONARIES:VIEW"),a=o.auth("DICTIONARIES:MANAGE");r.map("/mrpControllers",p,function(){e.loadPage(["app/mrpControllers/pages/MrpControllerListPage"],function(r){return new r({collection:l})})}),r.map("/mrpControllers/:id",function(r){e.loadPage(["app/mrpControllers/pages/MrpControllerDetailsPage"],function(e){return new e({model:new t({_id:r.params.id})})})}),r.map("/mrpControllers;add",a,function(){e.loadPage(["app/core/pages/AddFormPage","app/mrpControllers/views/MrpControllerFormView"],function(r,e){return new r({FormView:e,model:new t})})}),r.map("/mrpControllers/:id;edit",a,function(r){e.loadPage(["app/core/pages/EditFormPage","app/mrpControllers/views/MrpControllerFormView"],function(e,o){return new e({FormView:o,model:new t({_id:r.params.id})})})}),r.map("/mrpControllers/:id;delete",a,n.bind(null,t))});