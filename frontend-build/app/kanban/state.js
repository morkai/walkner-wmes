// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","../broker","../pubsub","../user","../core/Model","app/kanbanSupplyAreas/KanbanSupplyAreaCollection","app/kanbanComponents/KanbanComponentCollection","./KanbanSettingCollection","./KanbanTableView","./KanbanEntryCollection"],function(e,n,s,t,u,r,o,l,a,b){"use strict";function i(){f.auth={view:t.isAllowedTo("KANBAN:VIEW"),manage:t.isAllowedTo("KANBAN:MANAGE"),processEngineer:t.isAllowedTo("FN:process-engineer")}}var p=!1,c=!1,d=null,f=new u;return f.nlsDomain="kanban",f.broker=null,f.pubsub=null,f.url="/kanban/state",f.settings=new l,f.tableView=new a({_id:"mine"},{state:f}),f.supplyAreas=new r(null,{paginate:!1,rqlQuery:"sort(_id)"}),f.components=new o(null,{paginate:!1,rqlQuery:"exclude(changes)&sort(_id)"}),f.entries=new b(null,f),f.auth={},f.isLoading=function(){return p},f.parse=function(e){return["supplyAreas","components","entries"].forEach(function(n){if("string"==typeof e[n]){var s=JSON.parse(e[n]);f[n].reset(f[n].parse({totalCount:s.length,collection:s}))}}),{}},f.load=function(t){if(null!==d&&(clearTimeout(d),d=null),!c||t)return null===f.broker&&(f.broker=n.sandbox(),f.broker.subscribe("user.reloaded",i)),null===f.pubsub&&(f.pubsub=s.sandbox(),f.settings.setUpPubsub(f.pubsub),f.tableView.setUpPubsub(f.pubsub),f.supplyAreas.setUpPubsub(f.pubsub),f.components.setUpPubsub(f.pubsub),f.entries.setUpPubsub(f.pubsub)),i(),e.when(f.settings.fetch({reset:!0}),f.tableView.fetch(),f.fetch())},f.unload=function(){c&&(null!==d&&clearTimeout(d),d=setTimeout(function(){null!==f.broker&&(f.broker.destroy(),f.broker=null),null!==f.pubsub&&(f.pubsub.destroy(),f.pubsub=null),f.settings.reset([]),f.supplyAreas.reset([]),f.components.reset([]),f.entries.reset([]),d=null,c=!1},6e4))},f.on("request",function(){p=!0}),f.on("sync",function(){p=!1,c=!0}),f.on("error",function(){p=!1,c=!1,f.supplyAreas.reset([]),f.components.reset([]),f.entries.reset([])}),window.kanbanState=f});