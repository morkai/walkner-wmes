// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","./CagGroupCollection","./CagGroup","i18n!app/nls/cagGroups"],function(e,a,o,r,p,i){"use strict";var n=o.auth("REPORTS:VIEW","REPORTS:9:VIEW"),u=o.auth("REPORTS:MANAGE");e.map("/cagGroups",n,function(e){a.loadPage(["app/core/pages/ListPage"],function(a){return new a({collection:new p(null,{rqlQuery:e.rql}),columns:[{id:"name",className:"is-min"},{id:"color",className:"is-min"},"cags"]})})}),e.map("/cagGroups/:id",function(e){a.loadPage(["app/core/pages/DetailsPage","app/cagGroups/templates/details"],function(a,o){return new a({model:new i({_id:e.params.id}),detailsTemplate:o})})}),e.map("/cagGroups;add",u,function(){a.loadPage(["app/core/pages/AddFormPage","app/cagGroups/views/CagGroupFormView"],function(e,a){return new e({FormView:a,model:new i})})}),e.map("/cagGroups/:id;edit",u,function(e){a.loadPage(["app/core/pages/EditFormPage","app/cagGroups/views/CagGroupFormView"],function(a,o){return new a({FormView:o,model:new i({_id:e.params.id})})})}),e.map("/cagGroups/:id;delete",u,r.bind(null,i))});