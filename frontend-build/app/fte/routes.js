define(["underscore","../broker","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(e,t,a,r,n,p){"use strict";var i="css!app/fte/assets/main",d="i18n!app/nls/fte",o=n.auth("FTE:MASTER:VIEW"),f=n.auth("FTE:MASTER:MANAGE","PROD_DATA:MANAGE"),l=n.auth("FTE:LEADER:VIEW"),u=n.auth("FTE:LEADER:MANAGE","PROD_DATA:MANAGE"),s=n.auth("FTE:WH:VIEW"),g=n.auth("FTE:WH:MANAGE","PROD_DATA:MANAGE");a.map("/fte;settings",n.auth("PROD_DATA:MANAGE"),function(e){r.loadPage(["app/fte/pages/FteSettingsPage",i,d],function(t){return new t({initialTab:e.query.tab})})}),a.map("/fte/master",o,function(e){r.loadPage(["app/fte/FteMasterEntryCollection","app/fte/pages/FteMasterEntryListPage",i,d],function(t,a){return new a({collection:new t(null,{rqlQuery:e.rql})})})}),a.map("/fte/master;add",f,function(){r.loadPage(["app/fte/FteMasterEntry","app/fte/pages/FteMasterEntryAddFormPage",i,d],function(e,t){return new t({model:new e})})}),a.map("/fte/master/:id",o,function(e){e.query.change&&t.publish("router.navigate",{url:"/fte/master/"+e.params.id,trigger:!1,replace:!0}),r.loadPage(["app/fte/FteMasterEntry","app/fte/pages/FteMasterEntryDetailsPage",i,d],function(t,a){return new a({model:new t({_id:e.params.id}),change:e.query.change})})}),a.map("/fte/master/:id;edit",f,function(e){r.loadPage(["app/fte/FteMasterEntry","app/fte/pages/FteMasterEntryEditFormPage",i,d],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/master/:id;print",o,function(e){r.loadPage(["app/fte/FteMasterEntry","app/fte/pages/FteMasterEntryDetailsPrintablePage",i,d],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/master/:id;delete",f,e.partial(p,"app/fte/FteMasterEntry",e,e,{browseBreadcrumb:"BREADCRUMBS:master:browse"})),a.map("/fte/leader",l,function(e){r.loadPage(["app/fte/FteLeaderEntryCollection","app/fte/pages/FteLeaderEntryListPage",i,d],function(t,a){return new a({collection:new t(null,{rqlQuery:e.rql})})})}),a.map("/fte/leader;add",u,function(){r.loadPage(["app/fte/FteLeaderEntry","app/fte/pages/FteLeaderEntryAddFormPage",i,d],function(e,t){return new t({model:new e})})}),a.map("/fte/leader/:id",l,function(e){e.query.change&&t.publish("router.navigate",{url:"/fte/leader/"+e.params.id,trigger:!1,replace:!0}),r.loadPage(["app/fte/FteLeaderEntry","app/fte/pages/FteLeaderEntryDetailsPage",i,d],function(t,a){return new a({model:new t({_id:e.params.id}),change:e.query.change})})}),a.map("/fte/leader/:id;edit",u,function(e){r.loadPage(["app/fte/FteLeaderEntry","app/fte/pages/FteLeaderEntryEditFormPage",i,d],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/leader/:id;print",l,function(e){r.loadPage(["app/fte/FteLeaderEntry","app/fte/pages/FteLeaderEntryDetailsPrintablePage",i,d],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/leader/:id;delete",u,e.partial(p,"app/fte/FteLeaderEntry",e,e,{browseBreadcrumb:"BREADCRUMBS:leader:browse"})),a.map("/fte/wh",s,function(e){r.loadPage(["app/fte/FteWhEntryCollection","app/fte/pages/FteLeaderEntryListPage",i,d],function(t,a){return new a({collection:new t(null,{rqlQuery:e.rql})})})}),a.map("/fte/wh;add",g,function(){r.loadPage(["app/fte/FteWhEntry","app/fte/pages/FteLeaderEntryAddFormPage",i,d],function(e,t){return new t({model:new e})})}),a.map("/fte/wh/:id",s,function(e){e.query.change&&t.publish("router.navigate",{url:"/fte/wh/"+e.params.id,trigger:!1,replace:!0}),r.loadPage(["app/fte/FteWhEntry","app/fte/pages/FteLeaderEntryDetailsPage",i,d],function(t,a){return new a({model:new t({_id:e.params.id}),change:e.query.change})})}),a.map("/fte/wh/:id;edit",g,function(e){r.loadPage(["app/fte/FteWhEntry","app/fte/pages/FteLeaderEntryEditFormPage",i,d],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/wh/:id;print",s,function(e){r.loadPage(["app/fte/FteWhEntry","app/fte/pages/FteLeaderEntryDetailsPrintablePage",i,d],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/wh/:id;delete",g,e.partial(p,"app/fte/FteWhEntry",e,e,{browseBreadcrumb:"BREADCRUMBS:wh:browse"}))});