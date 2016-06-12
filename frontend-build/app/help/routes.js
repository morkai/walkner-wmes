// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../broker","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(e,a,t,r,n,i,d){"use strict";var p="i18n!app/nls/fte",u=r.auth("FTE:MASTER:VIEW"),o=r.auth("FTE:MASTER:MANAGE","PROD_DATA:MANAGE"),f=r.auth("FTE:LEADER:VIEW"),l=r.auth("FTE:LEADER:MANAGE","PROD_DATA:MANAGE");a.map("/fte/master",u,function(e){t.loadPage(["app/fte/pages/FteMasterEntryListPage",p],function(a){return new a({rql:e.rql})})}),a.map("/fte/master;add",o,function(){t.loadPage(["app/fte/pages/FteMasterEntryAddFormPage",p],function(e){return new e})}),a.map("/fte/master/:id",u,function(a){a.query.change&&e.publish("router.navigate",{url:"/fte/master/"+a.params.id,trigger:!1,replace:!0}),t.loadPage(["app/fte/pages/FteMasterEntryDetailsPage",p],function(e){return new e({modelId:a.params.id,change:a.query.change})})}),a.map("/fte/master/:id;edit",o,function(e){t.loadPage(["app/fte/pages/FteMasterEntryEditFormPage",p],function(a){return new a({modelId:e.params.id})})}),a.map("/fte/master/:id;print",u,function(e){t.loadPage(["app/fte/pages/FteMasterEntryDetailsPrintablePage",p],function(a){return new a({modelId:e.params.id})})}),a.map("/fte/master/:id;delete",o,n.bind(null,i)),a.map("/fte/leader",f,function(e){t.loadPage(["app/fte/pages/FteLeaderEntryListPage",p],function(a){return new a({rql:e.rql})})}),a.map("/fte/leader;add",l,function(){t.loadPage(["app/fte/pages/FteLeaderEntryAddFormPage",p],function(e){return new e})}),a.map("/fte/leader/:id",f,function(a){a.query.change&&e.publish("router.navigate",{url:"/fte/leader/"+a.params.id,trigger:!1,replace:!0}),t.loadPage(["app/fte/pages/FteLeaderEntryDetailsPage",p],function(e){return new e({modelId:a.params.id,change:a.query.change})})}),a.map("/fte/leader/:id;edit",l,function(e){t.loadPage(["app/fte/pages/FteLeaderEntryEditFormPage",p],function(a){return new a({modelId:e.params.id})})}),a.map("/fte/leader/:id;print",f,function(e){t.loadPage(["app/fte/pages/FteLeaderEntryDetailsPrintablePage",p],function(a){return new a({modelId:e.params.id})})}),a.map("/fte/leader/:id;delete",l,n.bind(null,d)),a.map("/fte;settings",r.auth("PROD_DATA:MANAGE"),function(e){t.loadPage(["app/fte/pages/FteSettingsPage",p],function(a){return new a({initialTab:e.query.tab})})})});