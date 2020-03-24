define(["../broker","../pubsub","../core/Model","app/production/ProductionSettingCollection","app/planning/WhOrderStatusCollection","./FactoryLayoutSettingCollection","./ProdLineState","./ProdLineStateCollection","./FactoryLayout"],function(t,e,s,n,r,u,o,i,a){"use strict";var c=[],d=!1,l=!1,p=null,b=new s;function f(t){if(d)return c.push(t);var e=b.prodLineStates.get(t._id);e&&t.v>e.get("v")&&e.update(t)}function y(){l&&setTimeout(h,1e4)}function h(){l&&(b.whOrderStatuses.setCurrentDate(),b.whOrderStatuses.fetch({reset:!0}))}return window.productionState=b,b.pubsub=null,b.url="/production/state",b.nlsDomain="factoryLayout",b.settings={factoryLayout:new u,production:new n},b.factoryLayout=new a,b.prodLineStates=new i(null,{settings:b.settings}),b.historyData=new i(null,{settings:b.settings}),b.whOrderStatuses=new r,b.isLoading=function(){return d},b.parse=function(t){return t.settings&&(this.settings.factoryLayout.reset(t.settings.filter(function(t){return/^factoryLayout/.test(t._id)})),this.settings.production.reset(t.settings.filter(function(t){return/^production/.test(t._id)}))),Array.isArray(t.prodLineStates)&&this.prodLineStates.reset(this.prodLineStates.parse(t)),t.factoryLayout&&this.factoryLayout.set(t.factoryLayout),Array.isArray(t.whOrderStatuses)&&this.whOrderStatuses.reset(this.whOrderStatuses.parse({collection:t.whOrderStatuses})),{}},b.load=function(t){if(null!==p&&(clearTimeout(p),p=null),!l||t)return null===b.pubsub&&(b.pubsub=e.sandbox(),b.pubsub.subscribe("production.stateChanged.**",f),b.pubsub.subscribe("shiftChanged",y),b.settings.factoryLayout.setUpPubsub(b.pubsub),b.settings.production.setUpPubsub(b.pubsub),b.whOrderStatuses.setUpPubsub(b.pubsub)),b.whOrderStatuses.setCurrentDate(),b.fetch()},b.unload=function(){l&&(null!==p&&clearTimeout(p),p=setTimeout(function(){null!==b.pubsub&&(b.pubsub.destroy(),b.pubsub=null),b.prodLineStates.reset([]),b.settings.factoryLayout.reset([]),b.settings.production.reset([]),b.whOrderStatuses.reset([]),p=null,l=!1},6e4))},b.on("request",function(){d=!0}),b.on("sync",function(){d=!1,l=!0,c.forEach(f),c=[]}),b.on("error",function(){d=!1,l=!1,c=[],b.prodLineStates.reset([])}),["divisions","subdivisions","mrpControllers","prodFlows","workCenters","prodLines"].forEach(function(e){t.subscribe(e+".synced",function(){l&&b.load(!0)})}),b});