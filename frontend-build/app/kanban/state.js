// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","../broker","../pubsub","../core/Model","./KanbanTableView","./KanbanSupplyAreaCollection","app/kanbanComponents/KanbanComponentCollection","./KanbanEntryCollection"],function(e,n,s,t,u,r,o,l){"use strict";var i=!1,a=!1,p=null,b=new t;return b.nlsDomain="kanban",b.pubsub=null,b.url="/kanban/state",b.settings=null,b.tableView=new u({_id:"mine"}),b.supplyAreas=new r,b.components=new o(null,{paginate:!1,rqlQuery:"exclude(changes)&sort(_id)"}),b.entries=new l(null,b),b.isLoading=function(){return i},b.parse=function(e){return e.settings&&this.settings.reset(e.settings),Array.isArray(e.supplyAreas)&&this.supplyAreas.reset(this.supplyAreas.parse({totalCount:e.supplyAreas.length,collection:e.supplyAreas})),Array.isArray(e.components)&&this.components.reset(this.components.parse({totalCount:e.components.length,collection:e.components})),Array.isArray(e.entries)&&this.entries.reset(this.entries.parse({totalCount:e.entries.length,collection:e.entries})),{}},b.load=function(n){if(null!==p&&(clearTimeout(p),p=null),!a||n)return null===b.pubsub&&(b.pubsub=s.sandbox(),b.tableView.setUpPubsub(b.pubsub),b.supplyAreas.setUpPubsub(b.pubsub),b.components.setUpPubsub(b.pubsub),b.entries.setUpPubsub(b.pubsub)),e.when(b.tableView.fetch(),b.fetch())},b.unload=function(){a&&(null!==p&&clearTimeout(p),p=setTimeout(function(){null!==b.pubsub&&(b.pubsub.destroy(),b.pubsub=null),b.settings&&b.settings.reset([]),b.supplyAreas.reset([]),b.components.reset([]),b.entries.reset([]),p=null,a=!1},6e4))},b.on("request",function(){i=!0}),b.on("sync",function(){i=!1,a=!0}),b.on("error",function(){i=!1,a=!1,b.supplyAreas.reset([]),b.components.reset([]),b.entries.reset([])}),window.kanbanState=b});