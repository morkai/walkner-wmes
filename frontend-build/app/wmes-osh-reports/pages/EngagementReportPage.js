define(["app/core/View","app/wmes-osh-common/dictionaries","../views/EngagementFilterView","../views/EngagementOrgUnitsView","../views/EngagementUsersView","app/wmes-osh-reports/templates/engagement/page"],function(e,t,i,s,n,r){"use strict";return e.extend({layoutName:"page",template:r,breadcrumbs:function(){return[this.t("breadcrumb"),this.t("engagement:breadcrumb")]},actions:function(){return[{label:this.t("settings:pageAction"),icon:"cogs",privileges:"OSH:DICTIONARIES:MANAGE",href:"#osh/reports;settings?tab=engagement"}]},initialize:function(){this.filterView=new i({model:this.model}),this.orgUnitsView=new s({model:this.model}),this.usersView=new n({model:this.model}),this.listenTo(this.filterView,"filterChanged",this.onFilterChanged),this.setView("#-filter",this.filterView),this.setView("#-orgUnits",this.orgUnitsView),this.setView("#-users",this.usersView)},load:function(e){return e(t.load().done(()=>this.model.fetch()))},onFilterChanged:function(e){this.model.rqlQuery=e,this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})}})});