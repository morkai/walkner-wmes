define(["../router","../viewport","../user"],function(e,i,n){"use strict";var a=n.auth("WH:VIEW");e.map("/wh/lines",a,function(e){i.loadPage(["app/core/pages/ListPage","app/wh-lines/WhLineCollection","app/wh-lines/views/ListView","i18n!app/nls/wh-lines"],function(i,n,a){return new i({baseBreadcrumb:"#wh/pickup/0d",pageClassName:"page-max-flex",ListView:a,collection:new n(null,{rqlQuery:e.rql}),actions:[]})})})});