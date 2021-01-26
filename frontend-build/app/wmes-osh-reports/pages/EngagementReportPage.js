define(["app/core/View","app/core/util/bindLoadingMessage","app/wmes-osh-common/dictionaries","../views/EngagementFilterView","../views/EngagementOrgUnitsView","../views/EngagementBrigadesView","../views/EngagementUsersView","app/wmes-osh-reports/templates/engagement/page"],function(e,i,t,s,n,r,o,h){"use strict";return e.extend({layoutName:"page",template:h,breadcrumbs:function(){return[this.t("breadcrumb"),this.t("engagement:breadcrumb")]},actions:function(){return[{label:this.t("settings:pageAction"),icon:"cogs",privileges:"OSH:DICTIONARIES:MANAGE",href:"#osh/reports;settings?tab=engagement"}]},initialize:function(){this.model=i(this.model,this),this.filterView=new s({model:this.model}),this.orgUnitsView=new n({model:this.model}),this.brigadesView=new r({model:this.model}),this.usersView=new o({model:this.model}),this.listenTo(this.filterView,"filterChanged",this.onFilterChanged),this.setView("#-filter",this.filterView),this.setView("#-orgUnits",this.orgUnitsView),this.setView("#-brigades",this.brigadesView),this.setView("#-users",this.usersView)},load:function(e){return e(t.load().done(()=>this.model.fetch()))},onFilterChanged:function(e){this.model.rqlQuery=e,this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})}})});