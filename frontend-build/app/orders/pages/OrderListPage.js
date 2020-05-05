define(["app/i18n","app/viewport","app/core/util/pageActions","app/core/util/bindLoadingMessage","app/core/View","app/delayReasons/storage","../OrderCollection","../views/OrderListView","../views/OrderFilterView","../views/OpenOrdersPrintView","app/core/templates/listPage"],function(e,i,t,s,n,r,o,l,a,c,h){"use strict";return n.extend({template:h,layoutName:"page",pageId:"orderList",breadcrumbs:[e.bound("orders","BREADCRUMB:browse")],actions:function(e){var s=this;return[t.jump(s,s.collection,{mode:"id"}),t.export(e,s,s.collection),{label:s.t("PAGE_ACTION:openOrdersPrint"),icon:"print",privileges:"USER",callback:function(){i.showDialog(new c,s.t("openOrdersPrint:title"))}},{label:s.t("PAGE_ACTION:tags"),icon:"tag",privileges:"ORDERS:MANAGE",href:"#productTags"},{label:s.t("PAGE_ACTION:notes"),icon:"sticky-note-o",privileges:"ORDERS:MANAGE",href:"#productNotes"},{label:s.t("PAGE_ACTION:settings"),icon:"cogs",privileges:"ORDERS:MANAGE",href:"#orders;settings"}]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},destroy:function(){r.release()},defineModels:function(){this.collection=s(new o(null,{rqlQuery:this.options.rql}),this),this.delayReasons=s(r.acquire(),this)},defineViews:function(){this.filterView=new a({model:{nlsDomain:this.collection.getNlsDomain(),rqlQuery:this.collection.rqlQuery}}),this.listView=new l({collection:this.collection,delayReasons:this.delayReasons}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(e){return e(this.collection.fetch({reset:!0}),this.delayReasons.isEmpty()?this.delayReasons.fetch({reset:!0}):null)},afterRender:function(){r.acquire()},refreshList:function(e){this.collection.rqlQuery=e,this.listView.refreshCollectionNow(),this.broker.publish("router.navigate",{url:this.collection.genClientUrl()+"?"+e,trigger:!1,replace:!0})}})});