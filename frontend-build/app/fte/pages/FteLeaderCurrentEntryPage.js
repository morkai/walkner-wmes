define(["app/i18n","app/core/View","../FteLeaderEntry","../views/FteCurrentEntryView","i18n!app/nls/fte"],function(e,t,i,n){return t.extend({layoutName:"page",pageId:"fteLeaderCurrentEntry",breadcrumbs:[{label:e.bound("fte","BREADCRUMBS:leader:entryList"),href:"#fte/leader"},e.bound("fte","BREADCRUMBS:leader:currentEntry")],initialize:function(){this.view=new n({model:new i({_id:"current"})})}})});