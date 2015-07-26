// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/subdivisions","./Subdivision","i18n!app/nls/subdivisions"],function(i,s,e,n,a,o){"use strict";var d=e.auth("DICTIONARIES:VIEW"),u=e.auth("DICTIONARIES:MANAGE");i.map("/subdivisions",d,function(){s.loadPage(["app/core/pages/ListPage","app/subdivisions/views/decorateSubdivision"],function(i,s){return new i({collection:a,columns:[{id:"division",className:"is-min"},{id:"type",className:"is-min"},{id:"name",className:"is-min"},"prodTaskTags",{id:"aor",className:"is-min"},{id:"autoDowntime",className:"is-min"}],serializeRow:s})})}),i.map("/subdivisions/:id",function(i){s.loadPage(["app/core/pages/DetailsPage","app/subdivisions/views/SubdivisionDetailsView"],function(s,e){return new s({DetailsView:e,model:new o({_id:i.params.id})})})}),i.map("/subdivisions;add",u,function(){s.loadPage("app/subdivisions/pages/AddSubdivisionFormPage",function(i){return new i({model:new o})})}),i.map("/subdivisions/:id;edit",u,function(i){s.loadPage("app/subdivisions/pages/EditSubdivisionFormPage",function(s){return new s({model:new o({_id:i.params.id})})})}),i.map("/subdivisions/:id;delete",u,n.bind(null,o))});