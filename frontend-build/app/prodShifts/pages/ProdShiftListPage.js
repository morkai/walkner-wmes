// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../ProdShiftCollection","../views/ProdShiftListView","../views/ProdShiftFilterView","app/core/templates/listPage"],function(i,t,e,s,r,o,n,h,l){"use strict";return r.extend({template:l,layoutName:"page",pageId:"prodShiftList",breadcrumbs:[i.bound("prodShifts","BREADCRUMBS:browse")],actions:function(i){return[s["export"](i,this,this.prodShiftList),s.add(this.prodShiftList,"PROD_DATA:MANAGE")]},initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".list-container",this.listView)},defineModels:function(){this.prodShiftList=e(new o(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.listView=new n({collection:this.prodShiftList}),this.filterView=new h({model:{rqlQuery:this.prodShiftList.rqlQuery}}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(i){return i(this.prodShiftList.fetch({reset:!0}))},refreshList:function(i){this.prodShiftList.rqlQuery=i,this.listView.refreshCollectionNow(),this.broker.publish("router.navigate",{url:this.prodShiftList.genClientUrl()+"?"+i,trigger:!1,replace:!0})}})});