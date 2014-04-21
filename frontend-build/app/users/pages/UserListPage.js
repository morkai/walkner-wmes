// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/i18n","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../UserCollection","../views/UserListView","../views/UserFilterView","app/users/templates/listPage"],function(s,e,i,t,n,r,l,c,o,u){return r.extend({template:u,layoutName:"page",pageId:"userList",remoteTopics:{"users.synced":"onSynced","users.syncFailed":"onSyncFailed"},breadcrumbs:[e.bound("users","BREADCRUMBS:browse")],actions:function(){var i=this;return[n.add(this.userList)].concat({label:e.bound("users","PAGE_ACTION:sync"),icon:"refresh",privileges:"USERS:MANAGE",callback:function(){return i.$syncAction=s("a",this),i.syncUsers(),!1}})},initialize:function(){this.$syncAction=null,this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".users-list-container",this.listView)},defineModels:function(){this.userList=t(new l(null,{rqlQuery:this.options.rql}),this)},defineViews:function(){this.listView=new c({collection:this.userList}),this.filterView=new o({model:{rqlQuery:this.userList.rqlQuery}}),this.listenTo(this.filterView,"filterChanged",this.refreshList)},load:function(s){return s(this.userList.fetch({reset:!0}))},refreshList:function(s){this.userList.rqlQuery=s,this.listView.refreshCollection(null,!0),this.broker.publish("router.navigate",{url:this.userList.genClientUrl()+"?"+s,trigger:!1,replace:!0})},syncUsers:function(){var s=this.$syncAction;if(!s.hasClass("disabled")){s.addClass("disabled"),s.find("i").removeClass("fa-refresh").addClass("fa-spinner fa-spin");var t=this;this.socket.emit("users.sync",function(s){s&&(i.msg.show({type:"error",text:e("users","MSG:SYNC_FAILURE")}),t.unlockSync())})}},unlockSync:function(){this.$syncAction.removeClass("disabled"),this.$syncAction.find("i").removeClass("fa-spinner fa-spin").addClass("fa-refresh"),this.$syncAction=null},onSynced:function(){null!==this.$syncAction&&(i.msg.show({type:"success",text:e("users","MSG:SYNCED"),time:2500}),this.unlockSync())},onSyncFailed:function(){null!==this.$syncAction&&(i.msg.show({type:"error",text:e("users","MSG:SYNC_FAILURE"),time:5e3}),this.unlockSync())}})});