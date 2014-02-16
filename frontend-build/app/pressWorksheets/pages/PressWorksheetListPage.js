define(["jquery","app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../PressWorksheetCollection","../views/PressWorksheetListView","app/pressWorksheets/templates/listPage"],function(e,t,n,r,i,o,a,s,u){return o.extend({template:u,layoutName:"page",pageId:"pressWorksheetList",breadcrumbs:[t.bound("pressWorksheets","BREADCRUMBS:browse")],actions:function(){return[i.add(this.pressWorksheetList)]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".pressWorksheets-list-container",this.listView)},defineModels:function(){this.pressWorksheetList=r(new a(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.listView=new s({collection:this.pressWorksheetList})},load:function(e){return e(this.pressWorksheetList.fetch({reset:!0}))},refreshList:function(e){this.pressWorksheetList.rqlQuery=e,this.listView.refreshCollection(null,!0),this.broker.publish("router.navigate",{url:this.pressWorksheetList.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});