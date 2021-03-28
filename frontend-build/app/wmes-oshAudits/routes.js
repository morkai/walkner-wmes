define(["underscore","../broker","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(e,s,i,a,t,o){"use strict";var p="css!app/wmes-oshAudits/assets/main",n="i18n!app/nls/wmes-oshAudits",d=t.auth("USER");i.map("/oshAuditCountReport",d,function(e){a.loadPage(["app/wmes-oshAudits/CountReport","app/wmes-oshAudits/pages/CountReportPage",p,"i18n!app/nls/reports",n],function(s,i){return new i({model:s.fromQuery(e.query)})})}),i.map("/oshAudits",d,function(e){a.loadPage(["app/core/pages/FilteredListPage","app/core/util/pageActions","app/kaizenOrders/dictionaries","app/wmes-oshAudits/OshAuditCollection","app/wmes-oshAudits/views/ListFilterView","app/wmes-oshAudits/views/ListView",p,n],function(s,i,a,t,o,p){return a.bind(new s({FilterView:o,ListView:p,collection:new t(null,{rqlQuery:e.rql}),actions:function(e){return[i.jump(this,this.collection),i.export(e,this,this.collection),i.add(this.collection,!1)]}}))})}),i.map("/oshAudits/:id",d,function(e){a.loadPage(["app/core/pages/DetailsPage","app/kaizenOrders/dictionaries","app/wmes-oshAudits/OshAudit","app/wmes-oshAudits/templates/details",p,n],function(s,i,a,t){return i.bind(new s({pageClassName:"page-max-flex",detailsTemplate:t,model:new a({_id:e.params.id})}))})}),i.map("/oshAudits;add",d,function(){a.loadPage(["app/core/pages/AddFormPage","app/kaizenOrders/dictionaries","app/wmes-oshAudits/OshAudit","app/wmes-oshAudits/views/FormView",p,n],function(e,s,i,a){return s.bind(new e({pageClassName:"page-max-flex",FormView:a,model:new i}))})}),i.map("/oshAudits/:id;edit",d,function(e){a.loadPage(["app/core/pages/EditFormPage","app/kaizenOrders/dictionaries","app/wmes-oshAudits/OshAudit","app/wmes-oshAudits/views/FormView",p,n],function(s,i,a,t){return i.bind(new s({pageClassName:"page-max-flex",FormView:t,model:new a({_id:e.params.id})}))})}),i.map("/oshAudits/:id;delete",d,e.partial(o,"app/wmes-oshAudits/OshAudit",e,e,{baseBreadcrumb:!0}))});