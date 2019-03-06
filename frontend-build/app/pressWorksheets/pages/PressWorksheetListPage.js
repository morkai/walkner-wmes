define(["app/i18n","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../PressWorksheetCollection","../views/PressWorksheetFilterView","../views/PressWorksheetListView","app/core/templates/listPage"],function(e,i,t,s,o,l,n,r){"use strict";return s.extend({template:r,layoutName:"page",pageId:"collection",breadcrumbs:[e.bound("pressWorksheets","BREADCRUMBS:browse")],actions:function(e){return[t.jump(this,this.collection),t.export(e,this,this.collection),t.add(this.collection)]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},defineModels:function(){this.collection=i(new o(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.filterView=new l({model:this.collection}),this.listView=new n({collection:this.collection}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}))},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow(),this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});