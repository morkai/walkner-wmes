// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user","../core/util/showDeleteFormPage","../data/subdivisions","./Subdivision"],function(i,s,e,a,n,d){"use strict";var o="i18n!app/nls/subdivisions",t=e.auth("DICTIONARIES:VIEW"),u=e.auth("DICTIONARIES:MANAGE");i.map("/subdivisions",t,function(){s.loadPage(["app/core/pages/ListPage","app/data/views/renderOrgUnitPath",o],function(i,s){return new i({collection:n,columns:[{id:"division",className:"is-min"},{id:"type",className:"is-min"},{id:"name",className:"is-min"},{id:"prodTaskTags",className:"is-min"},{id:"aor",className:"is-min"},"autoDowntimes",{id:"deactivatedAt",className:"is-min"}],serializeRow:function(i){return i.serializeRow({renderOrgUnitPath:s})}})})}),i.map("/subdivisions/:id",function(i){s.loadPage(["app/core/pages/DetailsPage","app/subdivisions/views/SubdivisionDetailsView",o],function(s,e){return new s({DetailsView:e,model:new d({_id:i.params.id})})})}),i.map("/subdivisions;add",u,function(){s.loadPage(["app/subdivisions/pages/AddSubdivisionFormPage",o],function(i){return new i({model:new d})})}),i.map("/subdivisions/:id;edit",u,function(i){s.loadPage(["app/subdivisions/pages/EditSubdivisionFormPage",o],function(s){return new s({model:new d({_id:i.params.id})})})}),i.map("/subdivisions/:id;delete",u,a.bind(null,d))});