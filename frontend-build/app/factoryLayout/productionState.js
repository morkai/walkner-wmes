// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../broker","../pubsub","../core/Model","app/production/ProductionSettingCollection","./FactoryLayoutSettingCollection","./ProdLineState","./ProdLineStateCollection","./FactoryLayout"],function(t,n,e,o,s,u,r,i){"use strict";function a(t){if(d)return l.push(t);var n=f.prodLineStates.get(t._id);n&&t.v>n.get("v")&&n.update(t)}var c=6e4,l=[],d=!1,p=!1,b=null,f=new e;return window.productionState=f,f.pubsub=null,f.url="/production/state",f.settings={factoryLayout:new s,production:new o},f.factoryLayout=new i,f.prodLineStates=new r(null,{settings:f.settings}),f.historyData=new r(null,{settings:f.settings}),f.isLoading=function(){return d},f.parse=function(t){return t.settings&&(this.settings.factoryLayout.reset(t.settings.filter(function(t){return/^factoryLayout/.test(t._id)})),this.settings.production.reset(t.settings.filter(function(t){return/^production/.test(t._id)}))),Array.isArray(t.prodLineStates)&&this.prodLineStates.reset(this.prodLineStates.parse(t)),t.factoryLayout&&this.factoryLayout.set(t.factoryLayout),{}},f.load=function(t){if(null!==b&&(clearTimeout(b),b=null),!p||t)return null===f.pubsub&&(f.pubsub=n.sandbox(),f.pubsub.subscribe("production.stateChanged.**",a),f.settings.factoryLayout.setUpPubsub(f.pubsub),f.settings.production.setUpPubsub(f.pubsub)),f.fetch()},f.unload=function(){p&&(null!==b&&clearTimeout(b),b=setTimeout(function(){null!==f.pubsub&&(f.pubsub.destroy(),f.pubsub=null),f.prodLineStates.reset([]),f.settings.factoryLayout.reset([]),f.settings.production.reset([]),b=null,p=!1},c))},f.on("request",function(){d=!0}),f.on("sync",function(){d=!1,p=!0,l.forEach(a),l=[]}),f.on("error",function(){d=!1,p=!1,l=[],f.prodLineStates.reset([])}),["divisions","subdivisions","mrpControllers","prodFlows","workCenters","prodLines"].forEach(function(n){t.subscribe(n+".synced",function(){p&&f.load(!0)})}),f});