// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../broker","../pubsub","../socket","../viewport","../time","../data/localStorage","./views/RestartMessageView","app/updater/templates/backendRestart","app/updater/templates/frontendRestart","i18n!app/nls/updater"],function(e,n,t,i,r,o,s,u,a,d){"use strict";function l(){g.versions.time=Date.now(),s.setItem(m,JSON.stringify(g.versions))}function p(){V||(V=!0,D&&(null!==k&&k.remove(),k=new u({template:a,type:"backend"}),r.insertView(k).render(),k.$el.slideDown()),n.subscribe("socket.connected").setLimit(1).on("message",function(){V=!1,null!==k&&k.$el.slideUp(function(){"backend"===k.options.type&&(k.remove(),k=null)}),n.publish("updater.backendRestarted")}),n.publish("updater.backendRestarting"))}function c(){E||(E=!0,window.addEventListener("mousemove",w),window.addEventListener("keypress",w),D&&(null!==k&&k.remove(),k=new u({template:d,type:"frontend"}),r.insertView(k).render(),k.$el.slideDown()),n.publish("updater.frontendRestarting"),w())}function w(){clearTimeout(R),R=setTimeout(f,6e4)}function f(){i.isConnected()&&(S=!0,n.publish("updater.frontendReloading"),window.location.reload())}var m="VERSIONS",b="BACKEND_SERVICE",v="FRONTEND_SERVICE",g={},R=null,k=null,V=!1,E=!1,S=!1,D=!0,N=window[b]||"backend",h=window[v]||"frontend",y=window[m],C=JSON.parse(s.getItem(m)||"null");return delete window[m],delete window[v],delete window[b],g.versions=C&&C.time>o.appData?C:y,g.isRestarting=function(){return V||E},g.isBackendRestarting=function(){return V},g.isFrontendRestarting=function(){return E},g.isFrontendReloading=function(){return S},g.enableViews=function(){D=!0},g.disableViews=function(){D=!1},g.pull=function(e){i.emit("updater.pull",e)},g.getCurrentVersionString=function(){return g.versions["package"]},l(),i.on("updater.versions",function(n){var t=g.versions;g.versions=n,e.isEqual(e.omit(n,"time"),e.omit(t,"time"))||l(),n.frontend!==t.frontend&&c()}),t.subscribe("updater.newVersion",function(e){n.publish("updater.newVersion",e),e.service===N?p():e.service===h&&c()}),window.updater=g,g});