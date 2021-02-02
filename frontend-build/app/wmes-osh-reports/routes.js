define(["app/router","app/viewport","app/user","./CountReport","./ObserversReport","./EngagementReport","./MetricsReport","./pages/CountReportPage","./pages/ObserversReportPage","./pages/EngagementReportPage","./pages/MetricsReportPage","i18n!app/nls/reports","i18n!app/nls/wmes-osh-reports"],function(e,r,s,t,p,a,o,n,g,i,l){"use strict";const u=s.auth("USER"),m=s.auth("OSH:DICTIONARIES:MANAGE");e.map("/osh/reports/count/:type",u,e=>{r.showPage(new n({model:new t({},{type:e.params.type,rqlQuery:e.rql})}))}),e.map("/osh/reports/observers",u,e=>{r.showPage(new g({model:new p({},{rqlQuery:e.rql})}))}),e.map("/osh/reports/engagement",u,e=>{r.showPage(new i({model:new a({},{rqlQuery:e.rql})}))}),e.map("/osh/reports/metrics",u,e=>{r.showPage(new l({model:new o({},{rqlQuery:e.rql})}))}),e.map("/osh/reports;settings",m,e=>{r.loadPage(["app/wmes-osh-reports/pages/SettingsPage"],r=>new r({initialTab:e.query.tab,initialSubtab:e.query.subtab}))})});