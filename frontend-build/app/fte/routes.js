define(["underscore","../broker","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(e,t,a,r,n,p){"use strict";var i="i18n!app/nls/fte",d=n.auth("FTE:MASTER:VIEW"),o=n.auth("FTE:MASTER:MANAGE","PROD_DATA:MANAGE"),f=n.auth("FTE:LEADER:VIEW"),l=n.auth("FTE:LEADER:MANAGE","PROD_DATA:MANAGE"),u=n.auth("FTE:WH:VIEW"),s=n.auth("FTE:WH:MANAGE","PROD_DATA:MANAGE");a.map("/fte;settings",n.auth("PROD_DATA:MANAGE"),function(e){r.loadPage(["app/fte/pages/FteSettingsPage",i],function(t){return new t({initialTab:e.query.tab})})}),a.map("/fte/master",d,function(e){r.loadPage(["app/fte/FteMasterEntryCollection","app/fte/pages/FteMasterEntryListPage",i],function(t,a){return new a({collection:new t(null,{rqlQuery:e.rql})})})}),a.map("/fte/master;add",o,function(){r.loadPage(["app/fte/FteMasterEntry","app/fte/pages/FteMasterEntryAddFormPage",i],function(e,t){return new t({model:new e})})}),a.map("/fte/master/:id",d,function(e){e.query.change&&t.publish("router.navigate",{url:"/fte/master/"+e.params.id,trigger:!1,replace:!0}),r.loadPage(["app/fte/FteMasterEntry","app/fte/pages/FteMasterEntryDetailsPage",i],function(t,a){return new a({model:new t({_id:e.params.id}),change:e.query.change})})}),a.map("/fte/master/:id;edit",o,function(e){r.loadPage(["app/fte/FteMasterEntry","app/fte/pages/FteMasterEntryEditFormPage",i],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/master/:id;print",d,function(e){r.loadPage(["app/fte/FteMasterEntry","app/fte/pages/FteMasterEntryDetailsPrintablePage",i],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/master/:id;delete",o,e.partial(p,"app/fte/FteMasterEntry",e,e,{browseBreadcrumb:"BREADCRUMBS:master:browse"})),a.map("/fte/leader",f,function(e){r.loadPage(["app/fte/FteLeaderEntryCollection","app/fte/pages/FteLeaderEntryListPage",i],function(t,a){return new a({collection:new t(null,{rqlQuery:e.rql})})})}),a.map("/fte/leader;add",l,function(){r.loadPage(["app/fte/FteLeaderEntry","app/fte/pages/FteLeaderEntryAddFormPage",i],function(e,t){return new t({model:new e})})}),a.map("/fte/leader/:id",f,function(e){e.query.change&&t.publish("router.navigate",{url:"/fte/leader/"+e.params.id,trigger:!1,replace:!0}),r.loadPage(["app/fte/FteLeaderEntry","app/fte/pages/FteLeaderEntryDetailsPage",i],function(t,a){return new a({model:new t({_id:e.params.id}),change:e.query.change})})}),a.map("/fte/leader/:id;edit",l,function(e){r.loadPage(["app/fte/FteLeaderEntry","app/fte/pages/FteLeaderEntryEditFormPage",i],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/leader/:id;print",f,function(e){r.loadPage(["app/fte/FteLeaderEntry","app/fte/pages/FteLeaderEntryDetailsPrintablePage",i],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/leader/:id;delete",l,e.partial(p,"app/fte/FteLeaderEntry",e,e,{browseBreadcrumb:"BREADCRUMBS:leader:browse"})),a.map("/fte/wh",u,function(e){r.loadPage(["app/fte/FteWhEntryCollection","app/fte/pages/FteLeaderEntryListPage",i],function(t,a){return new a({collection:new t(null,{rqlQuery:e.rql})})})}),a.map("/fte/wh;add",s,function(){r.loadPage(["app/fte/FteWhEntry","app/fte/pages/FteLeaderEntryAddFormPage",i],function(e,t){return new t({model:new e})})}),a.map("/fte/wh/:id",u,function(e){e.query.change&&t.publish("router.navigate",{url:"/fte/wh/"+e.params.id,trigger:!1,replace:!0}),r.loadPage(["app/fte/FteWhEntry","app/fte/pages/FteLeaderEntryDetailsPage",i],function(t,a){return new a({model:new t({_id:e.params.id}),change:e.query.change})})}),a.map("/fte/wh/:id;edit",s,function(e){r.loadPage(["app/fte/FteWhEntry","app/fte/pages/FteLeaderEntryEditFormPage",i],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/wh/:id;print",u,function(e){r.loadPage(["app/fte/FteWhEntry","app/fte/pages/FteLeaderEntryDetailsPrintablePage",i],function(t,a){return new a({model:new t({_id:e.params.id})})})}),a.map("/fte/wh/:id;delete",s,e.partial(p,"app/fte/FteWhEntry",e,e,{browseBreadcrumb:"BREADCRUMBS:wh:browse"}))});