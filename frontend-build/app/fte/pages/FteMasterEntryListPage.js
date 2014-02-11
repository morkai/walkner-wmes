define(["jquery","app/i18n","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../FteMasterEntryCollection","../views/FteMasterEntryListView","../views/FteEntryFilterView","app/fte/templates/listPage"],function(e,t,i,n,r,s,l,o,c){return r.extend({template:c,layoutName:"page",pageId:"fteMasterEntryList",breadcrumbs:[t.bound("fte","BREADCRUMBS:master:entryList")],actions:[{label:t.bound("fte","PAGE_ACTION:currentEntry"),href:"#fte/master/current",icon:"edit",privileges:"FTE:MASTER:MANAGE"}],initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".fte-list-container",this.listView)},defineModels:function(){this.collection=i(new s(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.filterView=new o({model:{rqlQuery:this.collection.rqlQuery}}),this.listView=new l({collection:this.collection}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}))},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollection(null,!0);var t=e.toString();this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+t,trigger:!1,replace:!0})}})});