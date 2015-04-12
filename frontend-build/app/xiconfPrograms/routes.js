// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../i18n","../router","../viewport","../user","../core/util/showDeleteFormPage","./XiconfProgram","./XiconfProgramCollection","i18n!app/nls/xiconfPrograms"],function(r,o,e,a,n,i,c,m){"use strict";function t(r){return function(){var e=r.prototype.breadcrumbs.call(this);return e.unshift(o.bound("xiconfPrograms","BREADCRUMBS:base")),e}}var s=n.auth("XICONF:VIEW"),p=n.auth("XICONF:MANAGE");e.map("/xiconf/programs",s,function(r){a.loadPage(["app/xiconfPrograms/pages/XiconfProgramListPage"],function(o){return new o({collection:new m(null,{rqlQuery:r.rql})})})}),e.map("/xiconf/programs/:id",s,function(r){a.loadPage(["app/core/pages/DetailsPage","app/xiconfPrograms/views/XiconfProgramDetailsView"],function(o,e){return new o({DetailsView:e,model:new c({_id:r.params.id}),breadcrumbs:t(o)})})}),e.map("/xiconf/programs;add",p,function(){a.loadPage(["app/core/pages/AddFormPage","app/xiconfPrograms/views/XiconfProgramFormView"],function(r,o){return new r({FormView:o,model:new c,breadcrumbs:t(r)})})}),e.map("/xiconf/programs/:id;edit",p,function(r){a.loadPage(["app/core/pages/EditFormPage","app/xiconfPrograms/views/XiconfProgramFormView"],function(o,e){return new o({FormView:e,model:new c({_id:r.params.id}),breadcrumbs:t(o)})})}),e.map("/xiconf/programs/:id;delete",p,r.partial(i,c,r,r,{breadcrumbs:t()}))});