define(["app/core/pages/FilteredListPage","app/core/util/pageActions","../views/FilterView","../views/ListView"],function(e,i,t,r){"use strict";return e.extend({baseBreadcrumb:!0,FilterView:t,ListView:r,actions:function(e){var t=this.collection;return[i.export(e,this,t,!1)]}})});