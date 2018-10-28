define(["underscore","../broker","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(e,p,n,r,t,a){"use strict";var i="i18n!app/nls/pfepEntries",f=t.auth(),s=t.auth("PFEP:MANAGE");n.map("/pfep/entries",f,function(e){r.loadPage(["app/pfepEntries/PfepEntryCollection","app/pfepEntries/pages/PfepEntryListPage",i],function(p,n){return new n({collection:new p(null,{rqlQuery:e.rql})})})}),n.map("/pfep/entries/:id",f,function(e){r.loadPage(["app/pfepEntries/PfepEntry","app/pfepEntries/pages/PfepEntryDetailsPage",i],function(p,n){return new n({model:new p({_id:e.params.id})})})}),n.map("/pfep/entries;add",s,function(){r.loadPage(["app/pfepEntries/PfepEntry","app/pfepEntries/pages/PfepEntryAddFormPage",i],function(e,p){return new p({model:new e})})}),n.map("/pfep/entries/:id;edit",s,function(e){r.loadPage(["app/pfepEntries/PfepEntry","app/pfepEntries/pages/PfepEntryEditFormPage",i],function(p,n){return new n({model:new p({_id:e.params.id})})})}),n.map("/pfep/entries/:id;delete",s,e.partial(a,"app/pfepEntries/PfepEntry",e,e,{baseBreadcrumb:!0}))});