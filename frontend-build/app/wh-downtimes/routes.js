define(["app/router","app/viewport","app/user","app/core/util/pageActions"],function(e,i,t,n){"use strict";var p=t.auth("WH:VIEW");e.map("/wh/downtimes",p,function(e){i.loadPage(["app/core/pages/FilteredListPage","app/wh-downtimes/WhDowntimeCollection","app/wh-downtimes/views/FilterView","app/wh-downtimes/views/ListView","i18n!app/nls/wh-downtimes"],function(i,t,p,o){return new i({baseBreadcrumb:"#wh/pickup/0d",FilterView:p,ListView:o,collection:new t(null,{rqlQuery:e.rql}),actions:function(e){return[n.export(e,this,this.collection)]}})})})});