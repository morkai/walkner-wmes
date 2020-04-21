define(["underscore","../broker","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(e,p,n,r,t,i){"use strict";var a="css!app/pfepEntries/assets/main",s="i18n!app/nls/pfepEntries",f=t.auth(),o=t.auth("PFEP:MANAGE");n.map("/pfep/entries",f,function(e){r.loadPage(["app/pfepEntries/dictionaries","app/pfepEntries/PfepEntryCollection","app/pfepEntries/pages/PfepEntryListPage",a,s],function(p,n,r){return p.bind(new r({collection:new n(null,{rqlQuery:e.rql})}))})}),n.map("/pfep/entries/:id",f,function(e){r.loadPage(["app/pfepEntries/PfepEntry","app/pfepEntries/pages/PfepEntryDetailsPage",a,s],function(p,n){return new n({model:new p({_id:e.params.id})})})}),n.map("/pfep/entries;add",o,function(){r.loadPage(["app/pfepEntries/dictionaries","app/pfepEntries/PfepEntry","app/pfepEntries/pages/PfepEntryAddFormPage",s],function(e,p,n){return e.bind(new n({model:new p}))})}),n.map("/pfep/entries/:id;edit",o,function(e){r.loadPage(["app/pfepEntries/dictionaries","app/pfepEntries/PfepEntry","app/pfepEntries/pages/PfepEntryEditFormPage",s],function(p,n,r){return p.bind(new r({model:new n({_id:e.params.id})}))})}),n.map("/pfep/entries/:id;delete",o,e.partial(i,"app/pfepEntries/PfepEntry",e,e,{baseBreadcrumb:!0}))});