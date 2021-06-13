define(["underscore","../broker","../router","../viewport","../user","../time","../core/util/showDeleteFormPage","../data/localStorage"],function(e,t,s,i,a,n,r,o){"use strict";var u="css!app/qiResults/assets/main",p="i18n!app/nls/qiResults",l=a.auth("QI:RESULTS:VIEW","FN:master","FN:leader","FN:manager","FN:wh"),g=a.auth("QI:INSPECTOR","QI:RESULTS:MANAGE","FN:leader","FN:wh"),R=a.auth("USER");s.map("/qi/reports/count",l,function(e){i.loadPage(["app/qiResults/QiCountReport","app/qiResults/pages/QiCountReportPage","i18n!app/nls/reports",u,p],function(t,s){return new s({model:t.fromQuery(e.query)})})}),s.map("/qi/reports/okRatio",l,function(e){i.loadPage(["app/qiResults/QiOkRatioReport","app/qiResults/pages/QiOkRatioReportPage","i18n!app/nls/reports",u,p],function(t,s){return new s({model:t.fromQuery(e.query)})})}),s.map("/qi/reports/nokRatio",l,function(e){i.loadPage(["app/qiResults/QiNokRatioReport","app/qiResults/pages/QiNokRatioReportPage","i18n!app/nls/reports",u,p],function(t,s){return new s({model:t.fromQuery(e.query)})})}),s.map("/qi/reports/outgoingQuality",l,function(e){i.loadPage(["app/qiResults/dictionaries","app/qiResults/QiOutgoingQualityReport","app/qiResults/pages/QiOutgoingQualityReportPage","i18n!app/nls/reports",u,p],function(t,s,i){return t.bind(new i({model:s.fromQuery(e.query)}))})}),s.map("/qi/results",l,function(e){i.loadPage(["app/qiResults/QiResultCollection","app/qiResults/pages/QiResultListPage",u,p],function(t,s){return new s({collection:new t(null,{rqlQuery:e.rql})})})}),s.map("/qi/results;ok",l,function(){t.publish("router.navigate",{url:"/qi/results?sort(-inspectedAt,-rid)&limit(-1337)&ok=true",trigger:!0,replace:!0})}),s.map("/qi/results;nok",l,function(){t.publish("router.navigate",{url:"/qi/results?sort(-inspectedAt,-rid)&limit(-1337)&ok=false",trigger:!0,replace:!0})}),s.map("/qi/results/:id",l,function(e){i.loadPage(["app/qiResults/QiResult","app/qiResults/pages/QiResultDetailsPage",u,p],function(t,s){return new s({model:new t({_id:e.params.id})})})}),s.map("/qi/results;add",g,function(e){i.loadPage(["app/qiResults/QiResult","app/qiResults/pages/QiResultAddFormPage",u,p,"css!app/suggestions/assets/main","i18n!app/nls/suggestions"],function(t,s){var i=null,r=null;return a.isAllowedTo("QI:INSPECTOR")?i=a.getInfo():a.isAllowedTo("FN:leader","FN:wh")&&(r=a.getInfo()),new s({model:new t({source:o.getItem("WMES_QI_SOURCE")||"prod",ok:"ok"===e.queryString,inspector:i,leader:r,inspectedAt:n.format(new Date,"YYYY-MM-DD"),qtyInspected:1,qtyToFix:0,qtyNok:0,qtyNokInspected:0})})})}),s.map("/qi/results/:id;edit",R,function(e){i.loadPage(["app/qiResults/QiResult","app/qiResults/pages/QiResultEditFormPage",u,p,"css!app/suggestions/assets/main","i18n!app/nls/suggestions"],function(t,s){return new s({model:new t({_id:e.params.id})})})}),s.map("/qi/results/:id;delete",g,e.partial(r,"app/qiResults/QiResult",e,e,{baseBreadcrumb:!0})),s.map("/qi/settings",a.auth("QI:DICTIONARIES:MANAGE"),function(e){i.loadPage(["app/qiResults/pages/QiSettingsPage",p],function(t){return new t({initialTab:e.query.tab})})})});