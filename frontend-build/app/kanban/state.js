// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","../broker","../pubsub","../user","../core/Model","../core/Collection","app/kanbanSupplyAreas/KanbanSupplyAreaCollection","app/kanbanContainers/KanbanContainerCollection","app/kanbanComponents/KanbanComponentCollection","./KanbanSettingCollection","./KanbanTableView","./KanbanEntryCollection","./KanbanPrintQueueBuilder"],function(e,n,s,t,r,u,o,l,a,i,b,p,c){"use strict";function d(){y.auth={view:t.isAllowedTo("KANBAN:VIEW"),manage:t.isAllowedTo("KANBAN:MANAGE"),processEngineer:t.isAllowedTo("FN:process-engineer"),leader:t.isAllowedTo("FN:leader")}}var w=!1,f=!1,A=null,y=new r;return y.nlsDomain="kanban",y.broker=null,y.pubsub=null,y.url="/kanban/state",y.settings=new i,y.tableView=new b({_id:"mine"},{state:y}),y.supplyAreas=new o(null,{paginate:!1,rqlQuery:"sort(_id)"}),y.containers=new l(null,{paginate:!1,rqlQuery:"sort(name)"}),y.components=new a(null,{paginate:!1,rqlQuery:"exclude(changes)&sort(_id)"}),y.entries=new p(null,{tableView:y.tableView,supplyAreas:y.supplyAreas,components:y.components}),y.builder=c.fromLocalStorage(),y.auth={},y.isLoading=function(){return w},y.parse=function(e){return["supplyAreas","containers","components","entries"].forEach(function(n){if("string"==typeof e[n]){var s=JSON.parse(e[n]);y[n].reset(y[n].parse({totalCount:s.length,collection:s}))}}),{}},y.load=function(t){if(null!==A&&(clearTimeout(A),A=null),!f||t)return null===y.broker&&(y.broker=n.sandbox(),y.broker.subscribe("user.reloaded",d)),null===y.pubsub&&(y.pubsub=s.sandbox(),y.settings.setUpPubsub(y.pubsub),y.tableView.setUpPubsub(y.pubsub),y.supplyAreas.setUpPubsub(y.pubsub),y.containers.setUpPubsub(y.pubsub),y.components.setUpPubsub(y.pubsub),y.entries.setUpPubsub(y.pubsub)),d(),e.when(y.settings.fetch({reset:!0}),y.tableView.fetch(),y.fetch())},y.unload=function(){f&&(null!==A&&clearTimeout(A),A=setTimeout(function(){null!==y.broker&&(y.broker.destroy(),y.broker=null),null!==y.pubsub&&(y.pubsub.destroy(),y.pubsub=null),y.settings.reset([]),y.supplyAreas.reset([]),y.containers.reset([]),y.components.reset([]),y.entries.reset([]),A=null,f=!1},6e4))},y.on("request",function(){w=!0}),y.on("sync",function(){w=!1,f=!0}),y.on("error",function(){w=!1,f=!1,y.supplyAreas.reset([]),y.containers.reset([]),y.components.reset([]),y.entries.reset([])}),window.kanbanState=y});