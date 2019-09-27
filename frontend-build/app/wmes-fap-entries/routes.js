define(["underscore","../broker","../router","../viewport","../user","../core/util/showDeleteFormPage","./views/NavbarView","./dictionaries","i18n!app/nls/wmes-fap-entries"],function(e,a,n,r,t,i,s,p){"use strict";var o="app/wmes-fap-entries/Entry",u=t.auth("USER"),f=t.auth("FAP:MANAGE");s.setUp(),n.map("/fap/entries",u,function(e){r.loadPage(["app/wmes-fap-entries/EntryCollection","app/wmes-fap-entries/pages/ListPage"],function(a,n){return e.rql.selector.args.forEach(function(e){"eq"===e.name&&"observers.user.id"===e.args[0]&&"mine"===e.args[1]&&(e.args[1]=t.data._id)}),new n({collection:new a(null,{rqlQuery:e.rql})})})}),n.map("/fap/entries/:id",u,function(e){r.loadPage([o,"app/wmes-fap-entries/pages/DetailsPage"],function(a,n){return new n({model:new a({_id:e.params.id})})})}),n.map("/fap/entries/:id;history",u,function(e){r.loadPage([o,"app/wmes-fap-entries/pages/HistoryPage"],function(a,n){return p.bind(new n({model:new a({_id:e.params.id})}))})}),n.map("/fap/entries/:id;delete",u,e.partial(i,o,e,e,{baseBreadcrumb:!0})),n.map("/fap/settings",f,function(e){r.loadPage(["app/wmes-fap-entries/pages/SettingsPage"],function(a){return new a({initialTab:e.query.tab})})}),n.map("/fap/reports/count",u,function(e){r.loadPage(["app/wmes-fap-entries/CountReport","app/wmes-fap-entries/pages/CountReportPage","i18n!app/nls/reports"],function(a,n){return new n({model:a.fromQuery(e.query)})})})});