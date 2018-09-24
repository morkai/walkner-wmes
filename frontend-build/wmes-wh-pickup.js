// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

!function(){"use strict";function e(){window.parent!==window?require(["app/data/localStorage"],function(e){e.start(n)}):n()}function n(){require(["domReady","jquery","backbone","backbone.layout","moment","app/monkeyPatch","app/broker","app/i18n","app/socket","app/router","app/viewport","app/updater/index","app/data/loadedModules","app/core/layouts/PageLayout","app/core/layouts/BlankLayout","app/time","app/wmes-wh-pickup-routes","bootstrap","moment-lang/"+window.appLocale,"select2-lang/"+window.appLocale,"i18n!app/nls/core"],o)}function o(e,n,o,a,t,i,r,p,c,u,s,l,d,w,g){function b(){null!==f&&(f.destroy(),f=null),r.subscribe("i18n.reloaded",function(e){localStorage.setItem("LOCALE",e.newLocale),s.render()}),e(function(){n("#app-loading").fadeOut(function(){n(this).remove()}),window.ENV&&document.body.classList.add("is-"+window.ENV+"-env"),o.history.start({root:"/",hashChange:!0,pushState:!1})})}var f=null;c.connect(),t.locale(window.appLocale),n.ajaxSetup({dataType:"json",accepts:{json:"application/json",text:"text/plain"},contentType:"application/json"}),a.configure({manage:!0,el:!1,keep:!0}),s.registerLayout("page",function(){return new w({version:l.getCurrentVersionString(),changelogUrl:"#changelog",hdHidden:!1})}),s.registerLayout("blank",function(){return new g}),r.subscribe("page.titleChanged",function(e){e.unshift(p("core","TITLE")),document.title=e.reverse().join(" < ")}),navigator.onLine?(f=r.sandbox(),f.subscribe("socket.connected",function(){f.subscribe("user.reloaded",b)}),f.subscribe("socket.connectFailed",b)):b()}window.requireApp=e}();