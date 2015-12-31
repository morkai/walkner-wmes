// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/subdivisions","./Subdivision"],function(i,s,e,n,a,o){"use strict";var d="i18n!app/nls/subdivisions",u=e.auth("DICTIONARIES:VIEW"),t=e.auth("DICTIONARIES:MANAGE");i.map("/subdivisions",u,function(){s.loadPage(["app/core/pages/ListPage","app/subdivisions/views/decorateSubdivision",d],function(i,s){return new i({collection:a,columns:[{id:"division",className:"is-min"},{id:"type",className:"is-min"},{id:"name",className:"is-min"},"prodTaskTags",{id:"aor",className:"is-min"},{id:"autoDowntime",className:"is-min"}],serializeRow:s})})}),i.map("/subdivisions/:id",function(i){s.loadPage(["app/core/pages/DetailsPage","app/subdivisions/views/SubdivisionDetailsView",d],function(s,e){return new s({DetailsView:e,model:new o({_id:i.params.id})})})}),i.map("/subdivisions;add",t,function(){s.loadPage(["app/subdivisions/pages/AddSubdivisionFormPage",d],function(i){return new i({model:new o})})}),i.map("/subdivisions/:id;edit",t,function(i){s.loadPage(["app/subdivisions/pages/EditSubdivisionFormPage",d],function(s){return new s({model:new o({_id:i.params.id})})})}),i.map("/subdivisions/:id;delete",t,n.bind(null,o))});