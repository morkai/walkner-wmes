define(["underscore","jquery","../broker","../pubsub","../socket","../viewport","../time","../i18n","../data/localStorage","./views/RestartMessageView","./views/BrowserUpdateDialogView","./views/AddressUpdateDialogView","app/updater/templates/backendRestart","app/updater/templates/frontendRestart","i18n!app/nls/updater"],function(e,n,t,i,o,r,s,a,d,u,w,l,c,p){"use strict";var f=70,m="VERSIONS",g={},v=null,b=null,E=!1,R=!1,h=!1,S=!0,D=window.BACKEND_SERVICE||"backend",V=window.FRONTEND_SERVICE||"frontend",k=window[m],I=JSON.parse(d.getItem(m)||"null");function C(){g.versions.time=Date.now(),d.setItem(m,JSON.stringify(g.versions))}function N(){R||E||(R=!0,window.addEventListener("mousemove",y),window.addEventListener("keypress",y),S&&(b&&b.cancelAnimations(!0,!0),b&&b.remove(),b=new u({template:p,type:"frontend"}),r.insertView(b).render(),b.$el.slideDown()),t.publish("updater.frontendRestarting"),window.navigator.serviceWorker&&window.navigator.serviceWorker.ready.then(function(e){return e.update()}).catch(e.noop),y())}function y(){clearTimeout(v),v=setTimeout(A,e.random(6e4,12e4))}function A(){o.isConnected()&&(h=!0,t.publish("updater.frontendReloading"),window.location.reload())}return delete window[m],delete window.FRONTEND_SERVICE,delete window.BACKEND_SERVICE,g.versions=I&&I.time>s.appData?I:k,g.isRestarting=function(){return E||R},g.isBackendRestarting=function(){return E},g.isFrontendRestarting=function(){return R},g.isFrontendReloading=function(){return h},g.enableViews=function(){S=!0},g.disableViews=function(){S=!1},g.pull=function(e){o.emit("updater.pull",e)},g.getCurrentVersionString=function(){return g.versions.package},C(),o.on("updater.versions",function(n){var t=g.versions;g.versions=n,e.isEqual(e.omit(n,"time"),e.omit(t,"time"))||C(),n.frontend!==t.frontend&&N()}),i.subscribe("updater.newVersion",function(e){t.publish("updater.newVersion",e),e.service===D?function(){if(E)return;E=!0,S&&(null!==b&&b.remove(),b=new u({template:c,type:"backend"}),r.insertView(b).render(),b.$el.slideDown());t.subscribe("socket.connected").setLimit(1).on("message",function(){if(E=!1,b){var e=b;e.$el.slideUp(function(){b===e&&(b.remove(),b=null)}),t.publish("updater.backendRestarted")}}),t.publish("updater.backendRestarting")}():e.service===V&&N()}),t.subscribe("viewport.page.shown",function(e){!function(e){if("dashboard"!==e.pageId||-1===window.navigator.vendor.toLowerCase().indexOf("google")||"1"===window.sessionStorage.getItem("WMES_BROWSER_UPDATE"))return;var n=window.navigator.userAgent.match(/Chrome\/([0-9]+)/);if(!n)return;if(+n[1]>=f)return;r.showDialog(new w,a("updater","browserUpdate:title"))}(e),function(e){if("dashboard"!==e.pageId||/\.wmes\.pl$/.test(window.location.hostname)||"localhost"===window.location.hostname||"1"===window.sessionStorage.getItem("WMES_ADDRESS_UPDATE")||window.document.body.classList.contains("is-embedded"))return;n.ajax({method:"GET",url:"https://ket.wmes.pl/ping",dataType:"text"}).done(function(e){"pong"===e&&r.showDialog(new l,a("updater","addressUpdate:title"))})}(e)}),window.updater=g,g});