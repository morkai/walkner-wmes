define(["../router","../viewport","../user"],function(e,t,i){"use strict";var r=i.auth("WH:VIEW");e.map("/wh/setCarts",r,function(e){t.loadPage(["app/core/pages/FilteredListPage","app/wh-setCarts/WhSetCartCollection","app/wh-setCarts/views/FilterView","app/wh-setCarts/views/ListView","i18n!app/nls/wh-setCarts"],function(t,i,r,s){return new t({baseBreadcrumb:"#wh/pickup/0d",FilterView:r,ListView:s,collection:new i(null,{rqlQuery:e.rql}),actions:[]})})})});