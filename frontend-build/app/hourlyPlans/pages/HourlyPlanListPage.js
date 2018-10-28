define(["app/i18n","app/user","app/core/util/pageActions","app/core/pages/FilteredListPage","app/fte/views/FteEntryFilterView","../HourlyPlanCollection","../views/HourlyPlanListView"],function(e,i,n,l,t,r,o){"use strict";return l.extend({FilterView:t,ListView:o,actions:function(l){return[{label:e.bound("hourlyPlans","PAGE_ACTION:add"),href:"#hourlyPlans;add",icon:"plus",privileges:function(){return i.isAllowedTo("HOURLY_PLANS:MANAGE","PROD_DATA:MANAGE")}},n.export(l,this,this.collection),{label:e.bound("hourlyPlans","PAGE_ACTION:planning"),href:"#planning/plans",icon:"calculator",privileges:"PLANNING:VIEW"}]},createFilterView:function(){return new t({model:{rqlQuery:this.collection.rqlQuery},divisionOnly:!0,divisionFilter:function(e){return"prod"===e.get("type")}})}})});